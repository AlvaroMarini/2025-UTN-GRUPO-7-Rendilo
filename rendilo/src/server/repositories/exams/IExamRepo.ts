import { Exam, Attempt } from "@/server/domain/exam";

export interface IExamRepo {
  list(): Promise<Exam[]>;
  get(id: number): Promise<Exam | null>;
  create(title: string): Promise<Exam>;
  update(id: number, patch: Partial<Exam>): Promise<Exam>;
  delete(id: number): Promise<void>;
  addAttempt(examId: number, studentId: string, answers: any[]): Promise<Attempt>;
  reviewAttempt(examId: number, attemptId: number, manualMarks: Record<number, boolean>): Promise<Attempt>;
}
