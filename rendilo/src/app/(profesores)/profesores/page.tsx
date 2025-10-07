"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { Pill, Card } from "@/components/ui";

export default function ProfesPage() {
  const { exams, addExam, deleteExam, hydrateFromApi } = useExamStore();
  const [title, setTitle] = useState("");

  useEffect(() => { void hydrateFromApi(); }, [hydrateFromApi]);

  const pending = exams.flatMap(ex =>
    (ex.attempts ?? [])
      .filter(a => !a.completed)
      .map(a => ({ exam: ex, attempt: a }))
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Rendilo Profes</h1>

      {pending.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Correcciones pendientes</h2>
            <Pill value={pending.length} />
          </div>
          <ul className="space-y-1">
            {pending.map(({ exam, attempt }) => (
              <li key={attempt.id} className="underline">
                <Link href={`/profesores/corregir/${exam.id}/${attempt.id}`}>
                  Intento #{attempt.id} en {exam.title}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold mb-2">Crear examen</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!title.trim()) return;
            await addExam(title.trim());
            setTitle("");
          }}
          className="flex gap-2"
        >
          <input className="border px-2 py-1 rounded w-full" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" />
          <button className="px-3 py-1 border rounded" type="submit">Crear</button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold mb-2">Mis exámenes</h2>
        <ul className="space-y-1">
          {exams.map(ex => (
            <li key={ex.id} className="flex items-center justify-between">
              <Link className="underline" href={`/examen/${ex.id}/editar`}>{ex.title}</Link>
              <button
                className="text-red-600 underline"
                onClick={async ()=>{ if(confirm("¿Eliminar?")) await deleteExam(ex.id); }}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
