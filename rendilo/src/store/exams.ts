// src/store/exams.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  apiListExams,
  apiCreateExam,
  apiUpdateExam,
  apiDeleteExam,
  apiSubmitAttempt,
  apiReviewAttempt,
  apiGetExam,
  type Exam,
  type Attempt,
} from "@/lib/api";

type State = {
  exams: Exam[];
  // Carga inicial/forzada desde el backend
  hydrateFromApi: () => Promise<void>;

  // Exámenes
  addExam: (title: string, published?: boolean) => Promise<void>;
  updateExam: (id: number, patch: Partial<Pick<Exam,"title"|"published"|"description"|"duration">>) => Promise<void>;
  deleteExam: (id: number) => Promise<void>;

  // Intentos / corrección
  submitAttempt: (examId: number, studentId: string, answers: any[]) => Promise<Attempt>;
  reviewOpenAnswer: (examId: number, attemptId: number, questionIndex: number, isCorrect: boolean) => Promise<Attempt>;
};

export const useExamStore = create<State>()(
  persist(
    (set, get) => ({
      exams: [],

      hydrateFromApi: async () => {
        const server = await apiListExams();
        set({ exams: server });
      },

      addExam: async (title, published) => {
        const created = await apiCreateExam(title, published);
        set({ exams: [...get().exams, created] });
      },

      updateExam: async (id, patch) => {
        const updated = await apiUpdateExam(id, patch);
        set({ exams: get().exams.map(e => (e.id === id ? updated : e)) });
      },

      deleteExam: async (id) => {
        await apiDeleteExam(id);
        set({ exams: get().exams.filter(e => e.id !== id) });
      },

      submitAttempt: async (examId, studentId, answers) => {
        const at = await apiSubmitAttempt(examId, studentId, answers);
        // refrescamos el examen (mantiene UI consistente)
        const ex = await apiGetExam(examId);
        set({ exams: get().exams.map(e => (e.id === examId ? ex : e)) });
        return at;
      },

      reviewOpenAnswer: async (examId, attemptId, questionIndex, isCorrect) => {
        // armamos parcial de manualMarks mergeable
        const partial = { [questionIndex]: isCorrect };
        const at = await apiReviewAttempt(examId, attemptId, partial);
        // refresco del examen
        const ex = await apiGetExam(examId);
        set({ exams: get().exams.map(e => (e.id === examId ? ex : e)) });
        return at;
      },
    }),
    {
      name: "rendilo-exams", // si querés podés cambiar/limitar persistencia
      partialize: (s) => ({ exams: s.exams }), // guardamos cache, pero viene de la API
    }
  )
);

export type { Exam, Attempt };
