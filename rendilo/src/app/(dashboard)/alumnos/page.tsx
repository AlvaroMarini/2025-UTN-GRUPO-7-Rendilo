"use client";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { Pill, Card } from "@/components/ui";

export default function AlumnosPage() {
  const { exams } = useExamStore();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Rendilo Alu</h1>
      {exams.map(ex => (
        <Card key={ex.id}>
          <div className="flex items-center justify-between">
            <Pill className="text-base">{ex.title}</Pill>
            {ex.lastScore == null
              ? <Link href={`/examen/${ex.id}/rendir`} className="inline-flex rounded-full border px-3 py-1">Rendir</Link>
              : <span className="inline-flex rounded-full border px-3 py-1">{ex.lastScore}/10</span>}
          </div>
        </Card>
      ))}
    </section>
  );
}
