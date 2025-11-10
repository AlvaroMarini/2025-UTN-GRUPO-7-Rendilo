"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuestionLimit = {
  open?: number;
  choice?: number;
  tof?: number;
  code?: number;
};

export type Option = {
  text: String;
  isCorrect: boolean;
}

export type Question =
  | { id: number; type: "choice"; examInstructions: string; options: Option[]}
  | { id: number; type: "tof"; examInstructions: string; tof: boolean}
  | { id: number; type: "open"; examInstructions: string}
  | { id: number; type: "code"; examInstructions: string}
  ;

export type Exam = {
  id: number;
  title: string;
  published: boolean;
  questions: Question[];
  lastScore: number | null;
  description?: string;
  duration?: number;
  attempts?: Attempt[];
  needsReview?: boolean;
  withCamera?: boolean;
  questionLimit?: QuestionLimit;
};

type State = {
  exams: Exam[];
  addExam: (title: string) => void;
  updateExam: (id: number, patch: Partial<Exam>) => void;
  submitAttempt: (id: number, studentId: string, answers: any[], questionOrder: number[]) => void;
  reviewManualAnswer: (examId: number, attemptId: number, questionIndex: number, isCorrect: boolean) => void;
  deleteExam: (id: number) => void;
  
};

export type Attempt = {
  id: number;
  studentId: string;
  answers: any[];
  autoScore: number | null;
  manualMarks: Record<number, boolean>; // key: questionIndex (solo abiertas), value: isCorrect
  finalScore: number | null;
  completed: boolean; // auto + todas abiertas revisadas
  submittedAt: number;
  questionOrder: number[];
};


export const useExamStore = create<State>()(
  persist(
    (set, get) => ({
      exams: [
        { id: 1, title: "Examen 1", published: true, questions: [], lastScore: null, attempts: [], needsReview: false, withCamera: false },
        { id: 2, title: "Examen 2", published: false, questions: [], lastScore: 0, attempts: [], needsReview: false, withCamera: false },
      ],


      addExam: (title) =>
        set((s) => ({
          exams: [
            ...s.exams,
            { id: Date.now(), title, published: false, questions: [], lastScore: null, attempts: [], needsReview: false, questionLimit: { open: 0, choice: 0, tof: 0, code: 0 }},
          ],
        })),


      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),


      submitAttempt: (id, studentId, answers, questionOrder) => {
        console.log("submitAttempt ejecutado:", { id, studentId, answers, questionOrder });
        const exam = get().exams.find((e) => e.id === id);
        if (!exam) return;

        const allQuestions = exam.questions || [];
        // 🔹 Seleccionamos solo las preguntas que el alumno realmente vio
        const shownQuestions =
          questionOrder && questionOrder.length > 0
            ? questionOrder.map((i) => allQuestions[i])
            : allQuestions;

        // 🔹 Evaluación automática (solo choice y tof)
        let autoCorrectCount = 0;
        shownQuestions.forEach((q, i) => {
          const a = answers[i];
          if (q.type === "choice") {
            const correctIndexes =
              q.options
                ?.map((opt, idx) => (opt.isCorrect ? idx : null))
                .filter((idx): idx is number => idx !== null) ?? [];

            if (Array.isArray(a)) {
              const allMatch =
                correctIndexes.length === a.length &&
                correctIndexes.every((ci) => a.includes(ci));
              if (allMatch) autoCorrectCount++;
            } else if (typeof a === "number") {
              if (correctIndexes.includes(a)) autoCorrectCount++;
            }
          }

          if (q.type === "tof") {
            if (a === q.tof) autoCorrectCount++;
          }
        });

        // 🔹 Calcular puntaje automático en base al número de preguntas mostradas
        const totalShown = shownQuestions.length;
        const autoScore = totalShown > 0 ? (autoCorrectCount / totalShown) * 10 : 0;

        console.log("DEBUG submitAttempt:", {
          shownQuestions,
          questionOrder,
          autoCorrectCount,
          totalShown,
          autoScore,
          studentId,
        });

        const attemptId = Date.now();
        const manualCount = shownQuestions.filter(
          (q) => q.type === "open" || q.type === "code"
        ).length;
        const completed = manualCount === 0;
        const finalScore = completed ? autoScore : null;

        // 🔹 Guardar intento
        set((s) => ({
          exams: s.exams.map((e) =>
            e.id === id
              ? {
                  ...e,
                  attempts: [
                    ...(e.attempts ?? []),
                    {
                      id: attemptId,
                      studentId,
                      answers,
                      questionOrder,
                      autoScore,
                      manualMarks: {},
                      finalScore,
                      completed,
                      submittedAt: Date.now(),
                    },
                  ],
                  lastScore: completed ? autoScore : e.lastScore ?? null,
                  needsReview: !completed,
                }
              : e
          ),
        }));
      },

      reviewManualAnswer: (examId, attemptId, questionIndex, isCorrect) => {
        set((s) => ({
          exams: s.exams.map((e) => {
            if (e.id !== examId) return e;

            const attempts = (e.attempts ?? []).map((a) => {
              if (a.id !== attemptId) return a;

              // ✅ Guardamos la marca del profesor
              const manualMarks = { ...(a.manualMarks ?? {}), [questionIndex]: !!isCorrect };

              // ✅ Solo consideramos las preguntas que el alumno realmente vio
              const shownQuestions =
                a.questionOrder && a.questionOrder.length > 0
                  ? a.questionOrder.map((i) => e.questions[i])
                  : e.questions;

              // ✅ Índices dentro de las mostradas que son manuales
              const manualIdxsShown = shownQuestions
                .map((q, idx) => (q.type === "open" || q.type === "code" ? idx : -1))
                .filter((i) => i >= 0);

              // ✅ Revisamos si todas las manuales ya tienen corrección
              const allReviewed =
                manualIdxsShown.length === 0 ||
                manualIdxsShown.every((idx) => manualMarks[idx] !== undefined);

              // ✅ Cantidad de respuestas manuales correctas
              const manualCorrect = manualIdxsShown.filter((idx) => manualMarks[idx] === true).length;

              // ✅ Total de preguntas que vio el alumno
              const totalShown = shownQuestions.length;

              // 🔹 AQUÍ VA EL CÓDIGO CORREGIDO 🔹
              // ✅ Recalcular correctas automáticas desde las respuestas
              const autoQuestions = shownQuestions.filter(q => q.type === "choice" || q.type === "tof");
              let autoCorrectCount = 0;
              
              shownQuestions.forEach((q, i) => {
                const answer = a.answers[i];
                if (q.type === "choice") {
                  const correctIndexes = q.options?.map((opt, idx) => (opt.isCorrect ? idx : null)).filter((idx): idx is number => idx !== null) ?? [];
                  if (Array.isArray(answer)) {
                    if (correctIndexes.length === answer.length && correctIndexes.every(ci => answer.includes(ci))) {
                      autoCorrectCount++;
                    }
                  } else if (typeof answer === "number" && correctIndexes.includes(answer)) {
                    autoCorrectCount++;
                  }
                } else if (q.type === "tof" && answer === q.tof) {
                  autoCorrectCount++;
                }
              });

              const totalCorrect = autoCorrectCount + manualCorrect;
              // 🔹 FIN DEL CÓDIGO CORREGIDO 🔹

              // ✅ Puntaje final: correctas / total * 10
              const final = allReviewed ? (totalCorrect / totalShown) * 10 : a.finalScore ?? null;

              console.log("✅ DEBUG reviewManualAnswer:", {
                manualMarks,
                manualIdxsShown,
                manualCorrect,
                totalShown,
                autoCorrectCount,
                totalCorrect,
                final,
                allReviewed,
              });

              return {
                ...a,
                manualMarks,
                finalScore: allReviewed ? final : a.finalScore,
                completed: allReviewed,
              };
            });

            // ✅ Actualizamos el examen con el intento corregido
            const last = attempts[attempts.length - 1];
            return {
              ...e,
              attempts,
              lastScore: last && last.completed ? last.finalScore : e.lastScore ?? null,
              needsReview: last ? !last.completed : e.needsReview,
            };
          }),
        }));
      },


      deleteExam: (id: number) =>
        set((s) => ({
        exams: s.exams.filter((e) => e.id !== id),
      })),
    }),
    { name: "rendilo-store" }
  )
);
