"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function NavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuth();



  return (
    <nav className="flex items-center gap-2 text-sm">
      {!role && (
        <Link href="/login" className='btn-primary py-2 px-4'>
          Iniciar sesión
        </Link>
      )}

      {role === "profesor" && (
        <Link href="/profesores" className='btn-primary py-2 px-4'>
          Profesores
        </Link>
      )}

      {role === "alumno" && (
        <Link href="/alumnos" className='btn-primary py-2 px-4'>
          Alumnos
        </Link>
      )}

      {role && (
        <button
          className="btn-primary py-2 px-4"
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
