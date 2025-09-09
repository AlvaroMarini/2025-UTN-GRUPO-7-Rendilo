import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useExamStore } from "../store/exams";

export default function ProfesPage() {
  const { exams, addExam } = useExamStore();
  const [title, setTitle] = useState("");

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Rendilo Profes</h1>

      {exams.map((ex) => (
        <div key={ex.id} className="flex items-center justify-between rounded-2xl border bg-white/80 p-4 shadow-sm">
          <span className="inline-flex rounded-full border px-3 py-1">{ex.title}</span>
          <Link to={`/examen/${ex.id}/editar`} className="inline-flex rounded-full border px-3 py-1">Editar</Link>
        </div>
      ))}

      <div className="flex gap-2">
        <input className="rounded-xl border px-3 py-2 flex-1" placeholder="Nuevo examen…" value={title}
               onChange={(e)=>setTitle(e.target.value)} />
        <button className="rounded-full border px-4 py-2"
                onClick={()=>{ if(title.trim()){ addExam(title.trim()); setTitle(""); }}}>
          + Nuevo
        </button>
      </div>
    </section>
  );
}
