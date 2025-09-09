import React from "react";
import { Link } from "react-router-dom";
import { useExamStore } from "../store/exams";

export default function AlumnosPage() {
  const { exams } = useExamStore();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Rendilo Alu</h1>
      {exams.map((ex) => (
        <div key={ex.id} className="flex items-center justify-between rounded-2xl border bg-white/80 p-4 shadow-sm">
          <span className="inline-flex rounded-full border px-3 py-1">{ex.title}</span>
          {ex.lastScore == null
            ? <Link to={`/examen/${ex.id}/rendir`} className="inline-flex rounded-full border px-3 py-1">Rendir</Link>
            : <span className="inline-flex rounded-full border px-3 py-1">{ex.lastScore}/10</span>}
        </div>
      ))}
    </section>
  );
}
