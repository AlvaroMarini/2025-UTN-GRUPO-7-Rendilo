import { NextResponse } from "next/server";
import { examRepo } from "@/server/repositories/exams";
import { updateExamBody } from "@/server/http/validators/examSchemas";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { badRequest, forbidden, notFound } from "@/server/http/errors";

type Ctx = { params: { id: string } };

export async function GET(_: Request, { params }: Ctx) {
  const ex = await examRepo.get(Number(params.id));
  if (!ex) return notFound();
  return NextResponse.json(ex);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "teacher") return forbidden();

  const body = await req.json();
  const parsed = updateExamBody.safeParse(body);
  if(!parsed.success) return badRequest(parsed.error.format());

  const ex = await examRepo.get(Number(params.id));
  if (!ex) return notFound();

  const updated = await examRepo.update(ex.id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "teacher") return forbidden();

  const ex = await examRepo.get(Number(params.id));
  if (!ex) return notFound();

  await examRepo.delete(ex.id);
  return new NextResponse(null, { status: 204 });
}
