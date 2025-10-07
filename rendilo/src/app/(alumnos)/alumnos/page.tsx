"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useExamStore } from "@/store/exams";

export default function AlumnosPage() {
  const { exams, hydrateFromApi } = useExamStore();
  useEffect(()=>{ void hydrateFromApi(); }, [hydrateFromApi]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Rendilo Alumnos</h1>
      <ul className="list-disc pl-6">
        {exams.filter(e=>e.published).map(e=>(
          <li key={e.id}>
            <Link className="underline" href={`/examen/${e.id}/rendir`}>{e.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
