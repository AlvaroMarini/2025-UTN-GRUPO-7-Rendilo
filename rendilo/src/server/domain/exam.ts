export type Option = { text: string; isCorrect: boolean };

export type Question =
  | { id: number; type: "choice"; examInstructions: string; options: Option[] }
  | { id: number; type: "tof";    examInstructions: string; tof: boolean }
  | { id: number; type: "open";   examInstructions: string };

export type Attempt = {
  id: number;
  studentId: string;
  answers: any[];
  autoScore: number | null;
  manualMarks: Record<number, boolean>;
  finalScore: number | null;
  completed: boolean;
};

export type Exam = {
  id: number;
  title: string;
  published: boolean;
  questions: Question[];
  attempts: Attempt[];
  lastScore: number | null;
  needsReview: boolean;
};
