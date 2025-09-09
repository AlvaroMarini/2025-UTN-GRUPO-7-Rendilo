import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useExamStore = create(
  persist(
    (set, get) => ({
      exams: [
        // demo inicial
        { id: 1, title: "Examen 1", questions: [], lastScore: null, published: true },
        { id: 2, title: "Examen 2", questions: [], lastScore: 0, published: false },
      ],
      addExam: (title) =>
        set((s) => ({
          exams: [...s.exams, { id: Date.now(), title, questions: [], published: false, lastScore: null }],
        })),
      updateExam: (id, data) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...data } : e)) })),
      removeExam: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
      submitAttempt: (id, answers) => {
        const exam = get().exams.find((e) => e.id === id);
        let score = 0;
        if (exam) {
          exam.questions.forEach((q, i) => {
            // Regla simple: 1 punto si coincide exactamente
            if (JSON.stringify(q.correct) === JSON.stringify(answers[i])) score++;
          });
        }
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, lastScore: score } : e)),
        }));
        return score;
      },
    }),
    { name: "rendilo-store" }
  )
);
