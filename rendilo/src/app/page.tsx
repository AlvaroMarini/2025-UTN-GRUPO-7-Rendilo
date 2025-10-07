import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // No logueado → a /login
  if (!session) redirect("/login");

  const role = (session as any).role;

  // Redirección por rol
  if (role === "teacher") redirect("/profesores");
  if (role === "student") redirect("/alumnos");

  // Fallback por si algún día aparece otro rol
  redirect("/login");
}
