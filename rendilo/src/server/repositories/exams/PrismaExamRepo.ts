import { PrismaClient } from "@prisma/client";
import { IExamRepo } from "./IExamRepo";
import { Exam, Attempt } from "@/server/domain/exam";

const prisma = new PrismaClient();

function mapExam(row: any): Exam {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    published: row.published,
    duration: row.duration ?? undefined,
    questions: row.questions.map((q: any) => ({
      id: q.id,
      type: q.type,
      examInstructions: q.examInstructions,
      options: q.options ?? undefined,
      tof: q.tof ?? undefined,
    })),
    attempts: row.attempts.map((a: any) => ({
      id: a.id,
      studentId: a.studentId,
      answers: a.answers,
      autoScore: a.autoScore ?? null,
      manualMarks: (a.manualMarks ?? {}) as Record<number, boolean>,
      finalScore: a.finalScore ?? null,
      completed: a.completed,
    })),
    lastScore: null,
    needsReview: row.attempts.some((a: any) => !a.completed),
  };
}

export class PrismaExamRepo implements IExamRepo {
  async list(): Promise<Exam[]> {
    const rows = await prisma.exam.findMany({ include: { questions: true, attempts: true }, orderBy: { id: "asc" } });
    return rows.map(mapExam);
  }
  async get(id: number): Promise<Exam | null> {
    const row = await prisma.exam.findUnique({ where: { id }, include: { questions: true, attempts: true } });
    return row ? mapExam(row) : null;
  }
  async create(title: string): Promise<Exam> {
    const row = await prisma.exam.create({ data: { title, published: false }, include: { questions: true, attempts: true } });
    return mapExam(row);
  }
  async update(id: number, patch: Partial<Exam>): Promise<Exam> {
    const row = await prisma.exam.update({
      where: { id },
      data: {
        title: patch.title ?? undefined,
        description: patch.description ?? undefined,
        published: patch.published ?? undefined,
        duration: patch.duration ?? undefined,
      },
      include: { questions: true, attempts: true }
    });
    return mapExam(row);
  }
  async delete(id: number): Promise<void> {
    await prisma.exam.delete({ where: { id } });
  }
  async addAttempt(examId: number, studentId: string, answers: any[]): Promise<Attempt> {
    const a = await prisma.attempt.create({
      data: { examId, studentId, answers, manualMarks: {}, completed: false }
    });
    return {
      id: a.id,
      studentId: a.studentId,
      answers: a.answers,
      autoScore: a.autoScore ?? null,
      manualMarks: (a.manualMarks ?? {}) as Record<number, boolean>,
      finalScore: a.finalScore ?? null,
      completed: a.completed,
    };
  }
  async reviewAttempt(examId: number, attemptId: number, manualMarks: Record<number, boolean>): Promise<Attempt> {
    const prev = await prisma.attempt.findUnique({ where: { id: attemptId } });
    if (!prev || prev.examId !== examId) throw new Error("Attempt not found");
    const merged = { ...(prev.manualMarks as any ?? {}), ...manualMarks };
    const manualScore = Object.values(merged).filter(Boolean).length;
    const finalScore = (prev.autoScore ?? 0) + manualScore;
    const a = await prisma.attempt.update({
      where: { id: attemptId },
      data: { manualMarks: merged, finalScore, completed: true }
    });
    return {
      id: a.id, studentId: a.studentId, answers: a.answers,
      autoScore: a.autoScore ?? null,
      manualMarks: (a.manualMarks ?? {}) as Record<number, boolean>,
      finalScore: a.finalScore ?? null,
      completed: a.completed,
    };
  }
}
