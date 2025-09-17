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
  const exam = exams.find((e) => e.id === Number(id));

  type TipoPregunta =
    | "abierta"
    | "multiple choice"
    | "verdadero o falso"
    | "codigo"
    | "";
  const [opcion, setOpcion] = useState<TipoPregunta>("");

  //para las multiple choice
  const [opciones, setOpciones] = useState<String[]>([]);
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
          onClick={() => router.push("/profesores")}
        >
          Volver
        </button>
      </div>

      <div className="my-6 space-y-4">
        {/* Campo Pregunta */}
        <label className="block">
          <span className="block mb-1 text-white text-sm font-medium">
            Consigna
          </span>
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
            placeholder="Escribe la pregunta aquí"
          />
        </label>

        <div>
          <label className="block">
            <span className="block mb-1 text-white text-sm font-medium">
              Selecciona una opción
            </span>
          </label>
          <select
            id="selector"
            value={opcion}
            onChange={(e) => setOpcion(e.target.value as TipoPregunta)}
            className="rounded-xl border border-gray-300 px-3 py-2 w-full text-dark-900 focus:outline-none focus:ring-2 focus:ring-white-500"
          >
            <option value="abierta">Pregunta abierta</option>
            <option value="multiple choice">Opcion multiple</option>
            <option value="verdadero o falso">Verdadero o falso</option>
            <option value="codigo">Codigo</option>
          </select>
        </div>
      </div>
      {opcion === "multiple choice" && (
        <div>
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
              <button
                type="button"
                className="rounded-xl bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
                onClick={() => {
                  if (nuevaOpcion) {
                    setOpciones([...opciones, nuevaOpcion]);
                    setNuevaOpcion("");
                  }
                }}
              >
                Agregar
              </button>
            </div>
          </label>

          {opciones.map((op, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <Pill className="text-base text-white">{op}</Pill>
                <div className="flex gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-white-600 focus:ring-white-500"
                  ></input>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="17"
                    fill="#f05353ff"
                    className="bi bi-trash3-fill"
                    viewBox="0 0 16 16"
                    onClick={() => {
                      setOpciones(opciones.filter((_, i) => i !== index));
                    }}
                  >
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {opcion === "verdadero o falso" && (
        <div className="space-y-2">
          <label>
            Ingrese la respuesta correcta
          </label>
          <Card>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="verdadero"
                name="verdadero-falso"
                className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="verdadero" className="text-white">
                Verdadero
              </label>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="falso"
                name="verdadero-falso"
                className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="falso" className="text-white">
                Falso
              </label>
            </div>
          </Card>
        </div>
      )}
      <div className="flex gap-2">
        <button
          className="rounded-full border px-4 py-2"
          onClick={() => router.push("/profes")}
        >
          Guardar
        </button>
      </div>
    </>
  );
}
