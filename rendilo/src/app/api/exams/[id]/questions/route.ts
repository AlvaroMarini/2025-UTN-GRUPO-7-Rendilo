import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { createQuestionBody } from "@/server/http/validators/examSchemas";
import { examRepo } from "@/server/repositories/exams";
import { badRequest, forbidden, notFound } from "@/server/http/errors";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "teacher") return forbidden();

  const body = await req.json();
  const parsed = createQuestionBody.safeParse(body);
  if(!parsed.success) return badRequest(parsed.error.format());

  // Para InMemory: hacemos un append sencillo
  const ex = await examRepo.get(Number(params.id));
  if (!ex) return notFound();

  const nextId = (ex.questions.at(-1)?.id ?? 0) + 1;
  ex.questions.push({
    id: nextId,
    type: parsed.data.type,
    examInstructions: parsed.data.examInstructions,
    options: parsed.data.options as any,
    tof: parsed.data.tof as any
  });
  const updated = await examRepo.update(ex.id, { questions: ex.questions });

  return NextResponse.json(updated, { status: 201 });
}
