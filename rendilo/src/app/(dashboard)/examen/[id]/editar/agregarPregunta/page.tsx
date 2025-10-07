"use client";
import { useParams, useRouter } from "next/navigation";
import { Question, Option, useExamStore } from "@/store/exams";
import { Card, Pill } from "@/components/ui";
import { useState } from "react";
import RequireRole from "@/components/requireRole";

export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));

  const [opcion, setOpcion] = useState<string>("open");
  const [examInstructions, setExamInstructions] = useState<string>("");

  //para las v o f
  const [vof, setVof] = useState<boolean | null>(null);

  //para las multiple choice
  const [opciones, setOpciones] = useState<Option[] | []>([]);
  const [nuevaOpcion, setNuevaOpcion] = useState("");

  const addQuestion = () => {
    if (!exam) return;
    if (!examInstructions.trim()) {
      alert("Debes escribir una consigna");
      return;
    }

    let newQuestion: Question;

    switch (opcion) {
      case "choice":
        if (opciones.length === 0) {
          alert("Debes agregar al menos una opción");
          return;
        }
        newQuestion = {
          id: Date.now(),
          type: "choice",
          examInstructions,
          options: opciones,
        };
        break;

      case "tof":
        if (vof === null) {
          alert("Debes seleccionar la respuesta correcta");
          return;
        }
        newQuestion = {
          id: Date.now(),
          type: "tof",
          examInstructions,
          tof: vof,
        };
        break;

      case "open":
        newQuestion = {
          id: Date.now(),
          type: "open",
          examInstructions,
        };
        break;

      default:
        alert("Debes seleccionar un tipo de pregunta");
        return;
    }

    // Agregar la pregunta al examen
    updateExam(exam.id, {
      questions: [...(exam.questions || []), newQuestion],
    });

    // Limpiar el formulario
    setExamInstructions("");
    setOpcion("");
    setOpciones([]);
    setNuevaOpcion("");
    setVof(null);

    
    router.push(`/examen/${id}/editar`);
  };

  return (
    <>
     <RequireRole role="profesor"></RequireRole>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Agregar Pregunta</h1>
        <button
          className="relative text-sm font-medium text-white transition
               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 
               after:bg-blue-500 after:transition-all after:duration-300
               hover:text-blue-400 hover:after:w-full
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          onClick={() => router.push(`/examen/${id}/editar`)}
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
            value={examInstructions}
            onChange={(e) => setExamInstructions(e.target.value)}
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
            onChange={(e) => setOpcion(e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 w-full text-gray-100 bg-indigo-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="open">Pregunta abierta-Codigo</option>
            <option value="choice">Opcion multiple</option>
            <option value="tof">Verdadero o falso</option>
          </select>
        </div>
      </div>
      {opcion === "choice" && (
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
                className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-100 bg-indigo-600
                shadow-sm transition duration-200
                hover:bg-indigo-500 hover:shadow-md 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
                onClick={() => {
                  if (nuevaOpcion) {
                    setOpciones([
                      ...opciones,
                      { text: nuevaOpcion, isCorrect: false },
                    ]);
                    setNuevaOpcion("");
                  }
                }}
              >
                Agregar
              </button>
            </div>
          </label>
        <div className="mt-6">
          {opciones.map((op, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <Pill className="text-base text-white">{op.text}</Pill>
                <div className="flex gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-white-600 focus:ring-white-500"
                    onChange={() => {
                      const newOpciones = opciones.map((option, i) =>
                        i === index
                          ? { ...option, isCorrect: !option.isCorrect }
                          : option
                      );
                      setOpciones(newOpciones);
                    }}
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
        </div>
      )}
      {opcion === "tof" && (
        <div className="space-y-2">
          <label>Ingrese la respuesta correcta</label>
          <Card>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="verdadero"
                name="verdadero-falso"
                className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={() => setVof(true)}
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
                onClick={() => setVof(false)}
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
            className="rounded-full border border-zinc-700 px-5 py-2 text-zinc-100 bg-indigo-600
              shadow-sm transition duration-200
              hover:bg-indigo-500 hover:shadow-md 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70" 
             onClick={addQuestion}>
          Guardar
        </button>
      </div>
    </>
  );
}
