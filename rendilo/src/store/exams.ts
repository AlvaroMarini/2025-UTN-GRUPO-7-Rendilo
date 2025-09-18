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
  ;

export type Exam = {
  id: number;
  title: string;
  published: boolean;
  questions: Question[];
  lastScore: number | null;
};

type State = {
  exams: Exam[];
  addExam: (title: string) => void;
  updateExam: (id: number, patch: Partial<Exam>) => void;
  //submitAttempt: (id: number, answers: any[]) => number;
};

export const useExamStore = create<State>()(
  persist(
    (set, get) => ({
      exams: [
        { id: 1, title: "Examen 1", published: true, questions: [], lastScore: null },
        { id: 2, title: "Examen 2", published: false, questions: [], lastScore: 0 },
      ],
      addExam: (title) =>
        set((s) => ({
          exams: [
            ...s.exams,
            { id: Date.now(), title, published: false, questions: [], lastScore: null },
          ],
        })),
      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      /*submitAttempt: (id, answers) => {
        const exam = get().exams.find((e) => e.id === id);
        let score = 0;
        if (exam) {
          exam.questions.forEach((q, i) => {
            if (q.type === "single" && answers[i] === q.correct) score++;
          });
        }
        set((s) => ({
          exams: s.exams.map((e) => (e.id === id ? { ...e, lastScore: score } : e)),
        }));
        return score;
      },*/
    }),
    { name: "rendilo-store" }
  )
);
