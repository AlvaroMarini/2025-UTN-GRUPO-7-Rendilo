// src/server/http/errors.ts
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export function badRequest(detail: any) {
  return Response.json({ status: 400, title: "Bad Request", detail }, { status: 400 });
}

export function forbidden(detail = "Forbidden") {
  return Response.json({ status: 403, title: "Forbidden", detail }, { status: 403 });
}

export function notFound(detail = "Not Found") {
  return Response.json({ status: 404, title: "Not Found", detail }, { status: 404 });
}
