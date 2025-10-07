import { z } from "zod";

export const createExamBody = z.object({
  title: z.string().min(1, "title requerido"),
  published: z.boolean().optional()
});

export const updateExamBody = z.object({
  title: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

export const createQuestionBody = z.object({
  type: z.enum(["choice","tof","open"]),
  examInstructions: z.string().min(1),
  // choice:
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean()
  })).optional(),
  // tof:
  tof: z.boolean().optional()
})
.refine((d)=> (d.type==="choice" ? Array.isArray(d.options) : true), {
  message: "options requerido para type=choice"
})
.refine((d)=> (d.type==="tof" ? typeof d.tof === "boolean" : true), {
  message: "tof requerido para type=tof"
});

export const submitAttemptBody = z.object({
  studentId: z.string().min(1),
  answers: z.array(z.any())
});

export const reviewAttemptBody = z.object({
  manualMarks: z.record(z.coerce.number(), z.boolean())
});
