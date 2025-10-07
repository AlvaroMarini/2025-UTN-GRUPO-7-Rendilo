"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/store/auth";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const current = useAuth((s) => s.role);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Evita desajustes de hidratación
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!current) router.replace("/login");
    else if (current !== role) {
      router.replace(current === "profesor" ? "/profesores" : "/alumnos");
    }
  }, [current, role, ready, router]);

  if (!ready) return null; // o un loader
  if (current !== role) return null;

  return <>{children}</>;
}
