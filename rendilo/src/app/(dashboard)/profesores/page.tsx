"use client";
import { useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { Pill, Card } from "@/components/ui";
import RequireRole from "@/components/requireRole";

export default function ProfesPage() {
  const { exams, addExam, deleteExam } = useExamStore();
  const [title, setTitle] = useState("");
  // Lista de intentos pendientes: exams[].attempts[] con completed=false
  const pending = exams.flatMap(ex =>
    (ex.attempts ?? [])
      .filter(a => !a.completed)
      .map(a => ({ exam: ex, attempt: a }))
  );
  return (
    <>
      <RequireRole role="profesor">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold mb-4">Rendilo Profes</h1>

        {pending.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Pendientes de corrección</h2>
            </div>
            <ul className="space-y-2">
              {pending.map(({ exam, attempt }) => (
                <li key={attempt.id} className="flex items-center justify-between rounded border p-2">
                  <div className="text-sm">
                    <div className="font-medium">{exam.title}</div>
                    <div className="opacity-80">
                      Alumno: <strong>{attempt.studentId}</strong> · Enviado: {new Date(attempt.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/profesores/corregir/${exam.id}/${attempt.id}`}
                    className="rounded-full border px-3 py-1 text-sm hover:bg-zinc-800"
                  >
                    Corregir
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {exams.map(ex => (
          <Card key={ex.id}>
            <div className="flex items-center justify-between">
              <Pill className="text-base">{ex.title}</Pill>
              <div>
                <Link href={`/examen/${ex.id}/editar`} 
                  className="inline-flex items-center justify-center rounded-full border border-zinc-600 
                   px-4 py-1.5 text-zinc-200
                   bg-zinc-900 transition
                   hover:bg-indigo-600 hover:text-white hover:border-indigo-500
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                >Editar</Link>
                <span
                  role="button"
                  aria-label={`Eliminar examen ${ex.title}`}
                  onClick={() => {
                    if (confirm(`¿Seguro que quieres eliminar el examen "${ex.title}"?`)) {
                      deleteExam(ex.id);
                    }
                  }}
                  className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-red-500/10 hover:text-red-400 cursor-pointer">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="18" height="18" fill="currentColor" 
                    viewBox="0 0 16 16">
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                </svg>
                </span>
              </div>
            </div>
          </Card>
        ))}
        <div className="flex gap-2">
          <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Nuevo examen…" value={title}
                onChange={(e)=>setTitle(e.target.value)} />
          <button className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-100 bg-indigo-600
               shadow-sm transition duration-200
               hover:bg-indigo-500 hover:shadow-md 
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                  onClick={()=>{ if(title.trim()){ addExam(title.trim()); setTitle(""); } }}>
            + Nuevo
          </button>
        </div>
      </section>
      </RequireRole>
    </>
  );
}
