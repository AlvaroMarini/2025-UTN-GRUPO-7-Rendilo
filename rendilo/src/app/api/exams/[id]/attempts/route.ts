import { NextResponse } from "next/server";
import { submitAttemptBody } from "@/server/http/validators/examSchemas";
import { examRepo } from "@/server/repositories/exams";
import { badRequest, notFound } from "@/server/http/errors";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const body = await req.json();
  const parsed = submitAttemptBody.safeParse(body);
  if(!parsed.success) return badRequest(parsed.error.format());

  const ex = await examRepo.get(Number(params.id));
  if(!ex) return notFound();

  const at = await examRepo.addAttempt(ex.id, parsed.data.studentId, parsed.data.answers);
  return NextResponse.json(at, { status: 201 });
}
