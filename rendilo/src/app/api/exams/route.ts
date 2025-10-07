import { NextResponse } from "next/server";
import { createExamBody } from "@/server/http/validators/examSchemas";
import { examRepo } from "@/server/repositories/exams";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { badRequest, forbidden } from "@/server/http/errors";

export async function GET(req: Request) {
  // Soportar ?for=student para extender (opcional); de momento devolvemos la lista
  const list = await examRepo.list();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).role !== "teacher") return forbidden();

  const body = await req.json();
  const parsed = createExamBody.safeParse(body);
  if(!parsed.success) return badRequest(parsed.error.format());

  const created = await examRepo.create(parsed.data.title);
  // si te pasaron published en el body:
  if (typeof parsed.data.published === "boolean") {
    await examRepo.update(created.id, { published: parsed.data.published });
  }
  const full = await examRepo.get(created.id);
  return NextResponse.json(full, { status: 201 });
}
