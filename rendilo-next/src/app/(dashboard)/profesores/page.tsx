"use client";
import { useState } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { Pill, Card } from "@/components/ui";

export default function ProfesPage() {
  const { exams, addExam } = useExamStore();
  const [title, setTitle] = useState("");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Rendilo Profes</h1>
      {exams.map(ex => (
        <Card key={ex.id}>
          <div className="flex items-center justify-between">
            <Pill className="text-base">{ex.title}</Pill>
            <Link href={`/examen/${ex.id}/editar`} className="inline-flex rounded-full border px-3 py-1">Editar</Link>
          </div>
        </Card>
      ))}
      <div className="flex gap-2">
        <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Nuevo examen…" value={title}
               onChange={(e)=>setTitle(e.target.value)} />
        <button className="rounded-full border px-4 py-2"
                onClick={()=>{ if(title.trim()){ addExam(title.trim()); setTitle(""); } }}>
          + Nuevo
        </button>
      </div>
    </section>
  );
}
