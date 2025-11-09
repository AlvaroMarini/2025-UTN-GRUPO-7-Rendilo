"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
};

type State = {
  exams: Exam[];
  addExam: (title: string) => void;
  updateExam: (id: number, patch: Partial<Exam>) => void;
  submitAttempt: (id: number, studentId: string, answers: any[]) => void;
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
            { id: Date.now(), title, published: false, questions: [], lastScore: null, attempts: [], needsReview: false },
          ],
        })),


      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),


      submitAttempt: (id, studentId, answers) => {
        const exam = get().exams.find((e) => e.id === id);
        if (!exam) return;
        // Auto-eval: solo choice y tof
        let autoCorrect = 0;
        const qs = exam.questions || [];
        qs.forEach((q, i) => {
          const a = answers[i]; 
          if (q.type === "choice") {
            // indices de las respuestas correctas
            const correctIndexes =
              q.options
                ?.map((opt, idx) => (opt.isCorrect ? idx : null))
                .filter((idx): idx is number => idx !== null) ?? [];

            if (Array.isArray(a)) {
              // el alumno marcó varias
              const allMatch =
                correctIndexes.length === a.length &&
                correctIndexes.every((ci) => a.includes(ci));
              if (allMatch) autoCorrect++;
            } else if (typeof a === "number") {
              // el alumno marcó una sola
              if (correctIndexes.includes(a)) autoCorrect++;
            }
          }
          if (q.type === "tof") {
            if (answers[i] === q.tof) autoCorrect++;
          }
        });
        // Crear intento
        const attemptId = Date.now();
        const manualCount = qs.filter(q => q.type === "open" || q.type === "code").length;
        const completed = manualCount === 0; // si no hay abiertas, ya está completo
        const finalScore = completed ? autoCorrect : null;
        set((s) => ({
          exams: s.exams.map((e) => e.id === id
            ? {
                ...e,
                attempts: [...(e.attempts ?? []), {
                  id: attemptId,
                  studentId,
                  answers,
                  autoScore: autoCorrect,
                  manualMarks: {},
                  finalScore,
                  completed,
                  submittedAt: Date.now(),
                }],
                lastScore: completed ? autoCorrect : null, // publicar nota solo si está completo
                needsReview: !completed,
              }
            : e)
        }));
      },


      reviewManualAnswer: (examId, attemptId, questionIndex, isCorrect) => {
        set((s) => ({
          exams: s.exams.map((e) => {
            if (e.id !== examId) return e;

            const attempts = (e.attempts ?? []).map((a) => {
              if (a.id !== attemptId) return a;

              const manualMarks = { ...(a.manualMarks ?? {}), [questionIndex]: !!isCorrect };

              // ahora incluye también las preguntas tipo "code"
              const manualIdxs = (e.questions || [])
                .map((q, i) => (q.type === "open" || q.type === "code") ? i : -1)
                .filter(i => i >= 0);

              const allReviewed =
                manualIdxs.length === 0 || manualIdxs.every((idx) => manualMarks[idx] !== undefined);

              const manualCorrect = Object.values(manualMarks).filter(Boolean).length;
              const final = allReviewed ? (a.autoScore ?? 0) + manualCorrect : a.finalScore ?? null;

              return {
                ...a,
                manualMarks,
                finalScore: final,
                completed: allReviewed,
              };
            });

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
