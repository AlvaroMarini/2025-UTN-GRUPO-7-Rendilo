"use client";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";
import { Card, Pill } from "@/components/ui";
import Link from "next/link";
import { useState } from "react";

export default function EditExam() {

  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find(e => e.id === Number(id));
  const [opciones , setOpciones] = useState<String[]>([])
  const [nuevaOpcion, setNuevaOpcion] = useState("");
  if (!exam) return <p>No existe el examen.</p>;
  

  /*const addQuestion = ( ) => {
    const q = { id: Date.now(), type: "single" as const, text: "Nueva pregunta", options: ["A", "B", "C", "D"], correct: 0 };
    updateExam(exam.id, { questions: [...(exam.questions || []), q] });
  };*/

  return (
    <>
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold text-white">Agregar Pregunta</h1>
  <button
    className="text-sm underline text-white hover:text-gray-300 transition"
    onClick={() => router.push("/profes")}
  >
    Volver
  </button>
</div>

<div className="my-6 space-y-4">
  {/* Campo Pregunta */}
  <label className="block">
    <span className="block mb-1 text-white text-sm font-medium">
      Pregunta
    </span>
    <input
      className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
      placeholder="Escribe la pregunta aquí"
    />
  </label>

 {/* Campo de Opción */}
    <label className="block">
        <span className="block mb-1 text-white text-sm font-medium">
        Opción
        </span>

    <div className="flex items-center gap-2">
    <input
        className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
        placeholder="Escribe la opción aquí"
        value={nuevaOpcion}
        onChange={(e) => setNuevaOpcion(e.target.value)}
    />
    <button type="button" className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition" onClick={
        () => {
    setOpciones([...opciones, nuevaOpcion]);
    setNuevaOpcion(""); 
    }}
    >
    Agregar
    </button>
  </div>
</label>

</div>


      {/* …resto igual al ejemplo anterior… */}
      {opciones.map((op,index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <Pill className="text-base text-white" >{op}</Pill>
          </div>
        </Card>
      ))}
      <div className="flex gap-2">
        <button className="rounded-full border px-4 py-2" onClick={() => router.push("/profes")}>Guardar</button>
      </div>
    </>

  );
}