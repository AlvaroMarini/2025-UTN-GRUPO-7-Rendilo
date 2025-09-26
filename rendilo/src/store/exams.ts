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
  description?: string;
  duration?: number;
};

type State = {
  exams: Exam[];
  addExam: (title: string) => void;
  updateExam: (id: number, patch: Partial<Exam>) => void;
  submitAttempt: (id: number, answers: any[]) => number;
  deleteExam: (id: number) => void;
};

export const useExamStore = create<State>()(
  persist(
    (set, get) => ({
      exams: [
        { id: 1, title: "Examen 1", published: true, questions: [], lastScore: null },
        { id: 2, title: "Examen 2", description: "", duration: 0, published: false, questions: [], lastScore: 0 },
      ],
      addExam: (title) =>
        set((s) => ({
          exams: [
            ...s.exams,
            { id: Date.now(), title, description: "", duration: 0, published: false, questions: [], lastScore: null },
          ],
        })),
      updateExam: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      submitAttempt: (id, answers) => {
        const exam = get().exams.find((e) => e.id === id);
        let correct = 0;
      
        if (exam) {
          exam.questions.forEach((q, i) => {
            // Multiple choice
            if (q.type === "choice") {
              const ansIndex = answers[i];
              if (ansIndex !== undefined && q.options[ansIndex]?.isCorrect) {
                correct++;
              }
            }
      
            // True/False
            if (q.type === "tof") {
              if (answers[i] === q.tof) {
                correct++;
              }
            }
      
            // Open: no se corrige automáticamente
          });
      
          // Calcular nota sobre 10
          const total = exam.questions.length;
          const score = Math.round((correct / total) * 10);
      
          // Guardar en store
          set((s) => ({
            exams: s.exams.map((e) =>
              e.id === id ? { ...e, lastScore: score } : e
            ),
          }));
      
          return score;
        }
      
        return 0;
      },
      deleteExam: (id: number) =>
        set((s) => ({
        exams: s.exams.filter((e) => e.id !== id),
      })),
    }),
    { name: "rendilo-store" }
  )
);
