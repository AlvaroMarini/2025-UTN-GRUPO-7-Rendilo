import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { reviewAttemptBody } from "@/server/http/validators/examSchemas";
import { examRepo } from "@/server/repositories/exams";
import { badRequest, forbidden, notFound } from "@/server/http/errors";

type Ctx = { params: { id: string, attemptId: string } };

export async function GET(_: Request, { params }: Ctx) {
  const ex = await examRepo.get(Number(params.id));
  if(!ex) return notFound();
  const at = ex.attempts.find(a => a.id === Number(params.attemptId));
  if(!at) return notFound();
  return NextResponse.json(at);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "teacher") return forbidden();

  const body = await req.json();
  const parsed = reviewAttemptBody.safeParse(body);
  if(!parsed.success) return badRequest(parsed.error.format());

  const ex = await examRepo.get(Number(params.id));
  if(!ex) return notFound();

  const res = await examRepo.reviewAttempt(ex.id, Number(params.attemptId), parsed.data.manualMarks);
  return NextResponse.json(res);
}
