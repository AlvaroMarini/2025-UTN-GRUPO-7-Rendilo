"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuth();

  const linkCls = (href: string) =>
    `rounded-full px-3 py-1.5 border transition ${
      pathname?.startsWith(href)
        ? "bg-indigo-600 text-white border-indigo-600 shadow"
        : "hover:bg-zinc-50"
    }`;

  return (
    <nav className="flex items-center gap-2 text-sm">
      {!role && (
        <Link href="/login" className={linkCls("/login")}>
          Iniciar sesión
        </Link>
      )}

      {role === "profesor" && (
        <Link href="/profesores" className={linkCls("/profesores")}>
          Profesores
        </Link>
      )}

      {role === "alumno" && (
        <Link href="/alumnos" className={linkCls("/alumnos")}>
          Alumnos
        </Link>
      )}

      {role && (
        <button
          className="rounded-full px-3 py-1.5 border hover:bg-zinc-400 cursor-pointer"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          Salir
        </button>
      )}
    </nav>
  );
}
