"use client";
import Link from "next/link";
import { useExamStore } from "@/store/exams";
import { Pill, Card } from "@/components/ui";
import RequireRole from "@/components/requireRole";

export default function AlumnosPage() {
  const { exams } = useExamStore();
  return (
    <>
    <RequireRole role="alumno"></RequireRole>
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Lista de examenes</h1>
      {exams.map(ex => (
        <Card key={ex.id}>
          <div className="flex items-center justify-between">
            <Pill className="text-base">{ex.title}</Pill>
            {ex.lastScore != null ? (
              <span className="inline-flex rounded-full border px-3 py-1">
                {(() => {
                   const total = (ex.questions || []).length || 10;
                   const raw = ((ex.lastScore ?? 0) / total) * 10;
                   const s = Math.round(raw * 10) / 10; // redondeo a 1 decimal
                   return Number.isInteger(s) ? s : s.toFixed(1);
                  })()}/10
              </span>
            ) : ex.attempts && ex.attempts.length > 0 ? (
              <span className="inline-flex rounded-full border px-3 py-1">Enviado · pendiente de corrección</span>
            ) : (
              <Link href={`/examen/${ex.id}/rendir`} className="inline-flex rounded-full border px-3 py-1">Rendir</Link>
            )}
          </div>
        </Card>
      ))}
    </section>
    </>
  );
}
