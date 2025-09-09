"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTabs() {
  const pathname = usePathname();
  const linkCls = (href: string) =>
    `rounded-full px-3 py-1.5 border transition ${
      pathname?.startsWith(href) ? "bg-indigo-600 text-white border-indigo-600 shadow" : "hover:bg-zinc-50"
    }`;

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/profesores" className={linkCls("/profesores")}>Profesores</Link>
      <Link href="/alumnos" className={linkCls("/alumnos")}>Alumnos</Link>
    </nav>
  );
}
