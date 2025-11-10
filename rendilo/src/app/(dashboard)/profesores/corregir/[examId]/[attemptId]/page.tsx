"use client";

import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";
import { useMemo, useState } from "react";
import RequireRole from "@/components/requireRole";

export default function CorregirIntentoPage() {
  const { examId, attemptId } = useParams<{ examId: string; attemptId: string }>();
  const router = useRouter();
  const { exams, reviewManualAnswer } = useExamStore();

  const exam = useMemo(() => exams.find(e => e.id === Number(examId)), [exams, examId]);
  if (!exam) return <div className="p-4">Examen no encontrado.</div>;

  const attempt = useMemo(() => (exam.attempts ?? []).find(a => a.id === Number(attemptId)), [exam, attemptId]);
  if (!attempt) return <div className="p-4">Intento no encontrado.</div>;

  const questions =
    attempt.questionOrder && attempt.questionOrder.length > 0
      ? attempt.questionOrder.map((i) => exam.questions[i])
      : exam.questions;

  const answers = attempt.answers || [];

  const manualIdxs = useMemo(() => questions.map((q:any, i:number) => (q.type === "open" || q.type === "code") ? i : -1).filter((i:number)=> i>=0), [questions]);
  // draft de corrección local (no toca el store hasta guardar)
  const [draftMarks, setDraftMarks] = useState<Record<number, boolean>>(() => ({ ...(attempt.manualMarks ?? {}) }));

  const allReviewed = manualIdxs.length === 0 || manualIdxs.every(idx => draftMarks[idx] !== undefined);

  function setMark(idx: number, value: boolean) {
    setDraftMarks(prev => ({ ...prev, [idx]: value }));
  }

  async function onSave() {
    if (!exam || !attempt) return;

    console.log("💾 Guardando correcciones...", draftMarks);

    for (const idx of manualIdxs) {
      const value = draftMarks[idx];
      if (value !== undefined) {
        // ✅ Usamos el índice local dentro del intento, no el índice global del examen
        reviewManualAnswer(exam.id, attempt.id, idx, value);
      }
    }

    await new Promise((r) => setTimeout(r, 100));

    console.log("✅ Correcciones guardadas. Redirigiendo...");
    router.push("/profesores");
  }

  function toText(v: any): string {
  if (v == null) return "";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return String(v);
  if (t === "object") {
    // casos típicos: { output: "..." } ó estructuras similares
    if ("output" in v && (typeof v.output === "string" || typeof v.output === "number" || typeof v.output === "boolean")) {
      return String((v as any).output);
    }
    try { return JSON.stringify(v); } catch { return ""; }
    }
    return "";
  }

  return (
    <>
    <RequireRole role="profesor">
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{exam.title}</h1>
          <div className="text-sm opacity-80">
            Alumno: <strong>{attempt.studentId}</strong> · Enviado: {new Date(attempt.submittedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-primary text-sm underline" onClick={() => router.push("/profesores")}>Volver</button>
          <button
            className="btn-primary p-2 text-sm ml-2"
            onClick={onSave}
            disabled={!allReviewed}
            title={allReviewed ? "Guardar correcciones" : "Marca todas las abiertas primero"}
          >
            Guardar correcciones
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q:any, i:number) => (
          <div key={q.id} className="border rounded p-4">
            <div className="font-medium mb-2">{attempt.questionOrder ? `#${attempt.questionOrder[i] + 1}. ` : `${i + 1}. `}
{q.examInstructions}
</div>

            {q.type === "choice" && (
              <div className="text-sm space-y-2">
                <div className="font-semibold mb-1">Respuestas seleccionadas por el alumno:</div>

                {/* Si el alumno respondió varias */}
                {Array.isArray(answers[i]) ? (
                  <ul className="list-disc ml-5">
                    {answers[i].map((ansIdx: number) => (
                      <li key={ansIdx}>
                        {q.options?.[ansIdx]?.text || `Opción ${ansIdx}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{q.options?.[answers[i]]?.text || "—"}</p>
                )}

                <div className="font-semibold mt-2">Respuestas correctas del profesor:</div>
                <ul className="list-disc ml-5 text-green-400">
                  {q.options
                    ?.map((opt: any, idx: number) => (opt.isCorrect ? { ...opt, idx } : null))
                    .filter(Boolean)
                    .map((opt: any) => (
                      <li key={opt.idx}>{opt.text}</li>
                    ))}
                </ul>

                {/* Evaluación automática */}
                {(() => {
                  const correctIndexes =
                    q.options
                      ?.map((opt: any, idx: number) => (opt.isCorrect ? idx : null))
                      .filter((idx: number | null) => idx !== null) ?? [];

                  const studentAnswers = Array.isArray(answers[i])
                    ? answers[i]
                    : typeof answers[i] === "number"
                    ? [answers[i]]
                    : [];

                  const allMatch =
                    correctIndexes.length === studentAnswers.length &&
                    correctIndexes.every((ci:number) => studentAnswers.includes(ci));

                  return (
                    <div
                      className={`mt-3 p-2 rounded ${
                        allMatch ? "bg-green-900/60 text-green-200" : "bg-red-900/60 text-red-200"
                      }`}
                    >
                      {allMatch
                        ? "Respuesta correcta"
                        : "Respuesta incorrecta"}
                    </div>
                  );
                })()}

                <div className="text-xs opacity-70 mt-1">* Se corrige automáticamente.</div>
              </div>
            )}


            {q.type === "tof" && (
              <div className="text-sm">
                Respuesta marcada: <strong>{answers[i] === true ? "Verdadero" : answers[i] === false ? "Falso" : "-"}</strong>
                <div className="text-xs opacity-70 mt-2">* Se corrige automáticamente.</div>
              </div>
            )}

            {q.type === "code" && (
              <div className="space-y-3">
                <div className="text-sm opacity-80">Código enviado:</div>
                <div className="rounded border p-3 bg-surface whitespace-pre-wrap text-sm font-mono">
                  {answers[i]?.code || answers[i]?.output || "Sin respuesta"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={
                      "rounded-full px-3 py-1 border " +
                      (draftMarks[i] === true ? "bg-green-900 text-white" : "")
                    }
                    onClick={() => setMark(i, true)}
                  >
                    Correcto
                  </button>
                  <button
                    className={
                      "rounded-full px-3 py-1 border " +
                      (draftMarks[i] === false ? "bg-red-900 text-white" : "")
                    }
                    onClick={() => setMark(i, false)}
                  >
                    Incorrecto
                  </button>
                  <span className="text-sm opacity-80">
                    Estado:{" "}
                    {draftMarks[i] === undefined
                      ? "Sin revisar"
                      : draftMarks[i]
                      ? "Marcado como correcto"
                      : "Marcado como incorrecto"}
                  </span>
                </div>
              </div>
            )}

            {q.type === "open" && (
              <div className="space-y-3">
                <div className="text-sm opacity-80">Respuesta del alumno:</div>
                <div className="rounded border p-3 bg-surface whitespace-pre-wrap text-sm">
                  {toText(answers[i])}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className={"rounded-full px-3 py-1 border " + (draftMarks[i] === true ? "bg-green-900 text-white" : "")}
                    onClick={() => setMark(i, true)}
                  >
                    Correcta
                  </button>
                  <button
                    className={"rounded-full px-3 py-1 border " + (draftMarks[i] === false ? "bg-red-900 text-white" : "")}
                    onClick={() => setMark(i, false)}
                  >
                    Incorrecta
                  </button>
                  <span className="text-sm opacity-80">
                    Estado: {draftMarks[i] === undefined ? "Sin revisar" : draftMarks[i] ? "Marcada como correcta" : "Marcada como incorrecta"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </RequireRole>
    </>
  );
}