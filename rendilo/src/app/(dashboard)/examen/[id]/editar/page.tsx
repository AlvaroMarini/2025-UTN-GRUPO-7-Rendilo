"use client";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";
import { Card, Pill } from "@/components/ui";
import Link from "next/link";

export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find(e => e.id === Number(id));
  if (!exam) return <p>No existe el examen.</p>;

/*const addQuestion = ( ) => {
    const q = { id: Date.now(), type: "single" as const, text: "Nueva pregunta", options: [], correct: 0 };
    updateExam(exam.id, { questions: [...(exam.questions || []), q] });
  };*/

  return (
    <>
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold text-white">Editar examen</h1>
  <button
    className="text-sm underline text-white hover:text-gray-300 transition"
    onClick={() => router.push("/profes")}
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
      placeholder="Escribe el título aquí"
    />
  </label>

      {/* …resto igual al ejemplo anterior… */}
      <div className="flex gap-2">
        <Link href={`/examen/${exam.id}/editar/agregarPregunta`} className="inline-flex rounded-full border px-3 py-1" >+ Pregunta</Link>
        <button className="rounded-full border px-4 py-2" onClick={() => router.push("/profes")}>Guardar</button>
      </div>
      {exam.questions.map(ex => (
        <Card key={ex.id}>
          <div className="flex items-center justify-between">
            <Pill className="text-base text-white" >{ex.text}</Pill>
          </div>
        </Card>
      ))}
     
    </>
  );
}
//Campo "Descripción/Instrucciones" (textarea opcional) ✅
//Duracion en minutos MM:SS  ✅
//Sección para agregar preguntas dinámicamente ✅ a medias
//Implementar Botón "Agregar Pregunta" guardar