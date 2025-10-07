import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session as any; // { user, role }
}
