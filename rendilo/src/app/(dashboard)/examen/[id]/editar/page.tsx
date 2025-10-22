"use client";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";
import { Card, Pill } from "@/components/ui";
import Link from "next/link";
import RequireRole from "@/components/requireRole";


export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));
  if (!exam) return <p>No existe el examen.</p>;

  return (
    <>
    <RequireRole role="profesor">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Editar examen</h1>
        <button
          className="relative text-sm font-medium text-white transition
               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 
               after:bg-blue-500 after:transition-all after:duration-300
               hover:text-blue-400 hover:after:w-full
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          onClick={() => router.push("/profesores")}
        >
          Volver
        </button>
      </div>

      <div className="my-6 space-y-4">
        {/* Campo de Título */}
        <label className="block">
          <span className="block mb-1 text-white text-sm font-medium">
            Título del examen
          </span>
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
            value={exam.title}
            onChange={(e) => updateExam(exam.id, { title: e.target.value })}
            placeholder="Escribe el título aquí"
          />
        </label>

        {/* Campo de Descripción */}
        <label className="block">
          <span className="block mb-1 text-white text-sm font-medium">
            Descripción
          </span>
          <textarea
            className="rounded-xl border border-gray-300  px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
            rows={4}
            placeholder="Agrega detalles o instrucciones del examen"
            value={exam.description ?? ""}
            onChange={(e) => updateExam(exam.id, { description: e.target.value })}
          />
        </label>
      </div>

      {/*Duracion*/}
      <label className="block">
        <span className="block mb-1 text-white text-sm font-medium">
          Duracion del examen (minutos)
        </span>
        <input
          type="number"
          className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
          placeholder="Ingrese la duracion en minutos"
          value={exam.duration ?? ""}
          onChange={(e) => updateExam(exam.id, { duration: Math.max(0, Number(e.target.value) || 0) })}
        />
      </label>
      <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={exam.withCamera ?? false}
            onChange={(e) => updateExam(exam.id, { withCamera: e.target.checked })}
          />
          <span className="text-white text-sm font-medium">
          Requiere cámara para rendir
          </span>
      </label>
      {/* …resto igual al ejemplo anterior… */}
      <div className="flex gap-2">
        <Link
          href={`/examen/${exam.id}/editar/agregarPregunta`}
          className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-100 bg-indigo-600
             shadow-sm transition duration-200
             hover:bg-indigo-500 hover:shadow-md 
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
        >
          + Pregunta
        </Link>
        <button
          className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-100 bg-indigo-600
             shadow-sm transition duration-200
             hover:bg-indigo-500 hover:shadow-md 
             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
          onClick={() => router.push("/profesores")}
        >
          Guardar
        </button>
      </div>
      {exam.questions.map((q, index) => (
        <label>
          Pregunta {index + 1}
          <Card key={index}>
            <div className="flex items-center justify-between">
              <Pill className="text-base text-white">{q.examInstructions}</Pill>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash3-fill"
                viewBox="0 0 16 16"
                onClick={() => {
                  updateExam(exam.id, {
                    questions: exam.questions.filter((_, i) => i !== index),
                  });
                }}
              >
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
              </svg>
            </div>
          </Card>
        </label>
      ))}</RequireRole>
    </>
  );
}
