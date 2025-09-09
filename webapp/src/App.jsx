import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-bold">R</div>
            <div className="leading-tight">
              <div className="text-xl font-semibold">Rendilo</div>
              <div className="text-xs text-zinc-500">Plataforma de exámenes</div>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink to="/profes" className={({isActive}) =>
              `rounded-full px-3 py-1.5 border ${isActive ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white hover:bg-zinc-50"}`
            }>Profes</NavLink>
            <NavLink to="/alumnos" className={({isActive}) =>
              `rounded-full px-3 py-1.5 border ${isActive ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white hover:bg-zinc-50"}`
            }>Alumnos</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-4xl px-4 py-10 text-xs text-zinc-500">
        © {new Date().getFullYear()} Rendilo
      </footer>
    </div>
  );
}
