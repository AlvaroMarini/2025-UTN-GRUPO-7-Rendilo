// src/lib/api.ts
import { jsonFetch } from "./http";

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
  description?: string;
  duration?: number;
  questions: Question[];
  attempts: Attempt[];
  lastScore: number | null;
  needsReview: boolean;
};

export async function apiListExams(): Promise<Exam[]> {
  return jsonFetch<Exam[]>("/api/exams", { method: "GET" });
}
export async function apiGetExam(id: number): Promise<Exam> {
  return jsonFetch<Exam>(`/api/exams/${id}`, { method: "GET" });
}
export async function apiCreateExam(title: string, published?: boolean): Promise<Exam> {
  return jsonFetch<Exam>("/api/exams", {
    method: "POST",
    body: JSON.stringify({ title, ...(published !== undefined ? { published } : {}) }),
  });
}
export async function apiUpdateExam(id: number, patch: Partial<Pick<Exam,"title"|"published"|"description"|"duration">>): Promise<Exam> {
  return jsonFetch<Exam>(`/api/exams/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
export async function apiDeleteExam(id: number): Promise<void> {
  await jsonFetch<void>(`/api/exams/${id}`, { method: "DELETE", parseAs: "text" });
}
export async function apiAddQuestion(examId: number, payload: any): Promise<Exam> {
  // payload: { type:"choice"|"tof"|"open", examInstructions:string, options?, tof? }
  return jsonFetch<Exam>(`/api/exams/${examId}/questions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export async function apiSubmitAttempt(examId: number, studentId: string, answers: any[]): Promise<Attempt> {
  return jsonFetch<Attempt>(`/api/exams/${examId}/attempts`, {
    method: "POST",
    body: JSON.stringify({ studentId, answers }),
  });
}
export async function apiGetAttempt(examId: number, attemptId: number): Promise<Attempt> {
  return jsonFetch<Attempt>(`/api/exams/${examId}/attempts/${attemptId}`, { method: "GET" });
}
export async function apiReviewAttempt(examId: number, attemptId: number, manualMarks: Record<number, boolean>): Promise<Attempt> {
  return jsonFetch<Attempt>(`/api/exams/${examId}/attempts/${attemptId}`, {
    method: "PATCH",
    body: JSON.stringify({ manualMarks }),
  });
}
