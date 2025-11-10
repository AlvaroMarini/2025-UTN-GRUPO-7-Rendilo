"use client";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";
import { Card, Pill } from "@/components/ui";
import Link from "next/link";
import RequireRole from "@/components/requireRole";
import Hint from "@/components/alerts/Hint";
import { useState } from "react"; 
import { showWarning } from "@/store/alerts";



export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));
  if (!exam) return <p>No existe el examen.</p>;

  const [showErrors, setShowErrors] = useState(false);
  const [examCopy, setExamCopy] = useState({ ...exam, withCamera: exam.withCamera ?? false });

  type ExamType = typeof exam;
  
  const updateExamCopy = (changes: Partial<ExamType>) => {
    setExamCopy(prev => ({ ...prev, ...changes }));
  };

const validarGuardar = () => {
  setShowErrors(true);
   if (!examCopy.title.trim()) {
      return false;
   } 
   if (examCopy.duration == undefined || examCopy.duration == 0) {
      return false;
   }
   if (examCopy.questions.length === 0) {
      showWarning("El examen debe tener al menos una pregunta");
      return false;
   }
    return true;
  }

  const handleSave = () => {
    if (validarGuardar()) {
      const updatedExam = {
        ...examCopy,
        withCamera: examCopy.withCamera ?? false,
      };
      updateExam(exam.id, updatedExam);
      router.push(`/profesores`);
    }
  }

  const handleAddQuestion = () => { 
    const updatedExam = {
        ...examCopy,
        withCamera: examCopy.withCamera ?? false,
      };
    updateExam(exam.id, updatedExam);
    router.push(`/examen/${exam.id}/editar/agregarPregunta`);
   } 

  const handleBack = () => {
    // Discard changes and go back
    router.push(`/profesores`);
  }

  return (
    <>
    <RequireRole role="profesor">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-dark">Editar examen</h1>
        <button
          className="relative text-sm font-medium text-white transition
               after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 
               after:bg-blue-500 after:transition-all after:duration-300
               hover:text-blue-400 hover:after:w-full
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          onClick={handleBack}
        >
          Volver
        </button>
      </div>

      <div className="my-6 space-y-4">
        {/* Campo de Título */}
        <label className="block">
          <span className="block mb-1 text-dark text-sm font-medium">
            Título del examen*
          </span>
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
            value={examCopy.title}
            onChange={(e) => updateExamCopy({ title: e.target.value })}
            placeholder="Escribe el título aquí"
          />
          <Hint show={showErrors && !examCopy.title.trim()}
            message="El título del examen es obligatorio."type="error"/>
        </label>

        {/* Campo de Descripción */}
        <label className="block">
          <span className="block mb-1 text-dark text-sm font-medium">
            Descripción
          </span>
          <textarea
            className="rounded-xl border border-gray-300  px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
            rows={4}
            placeholder="Agrega detalles o instrucciones del examen"
            value={examCopy.description ?? ""}
            onChange={(e) => updateExamCopy({ description: e.target.value })}
          />
        </label>
      </div>

      {/*Duracion*/}
      <label className="block">
        <span className="block mb-1 text-dark text-sm font-medium">
          Duracion del examen* (minutos)
        </span>
        <input
          type="number"
          className="rounded-xl border border-gray-300 px-3 py-2 w-full text-white-900 focus:outline-none focus:ring-2 focus:ring-white-500"
          placeholder="Ingrese la duracion en minutos"
          value={examCopy.duration}
          onChange={(e) => updateExamCopy({ duration: Math.max(0, Number(e.target.value)) })}
        />
        <Hint show={showErrors && (!examCopy.duration || examCopy.duration === 0)}
            message="La duración del examen no puede estar vacía." type="error"
            />
      </label>
      <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={!!examCopy.withCamera}
            onChange={(e) => updateExamCopy({ withCamera: e.target.checked })}
          />
          <span className="text-dark text-sm font-medium">
          Requiere cámara para rendir
          </span>
      </label>

      {/* Límite de preguntas aleatorias para los alumnos */}
      <div className="mt-6 border-t border-gray-600 pt-4">
        <h3 className="font-semibold text-lg mb-2">Límites de preguntas por tipo</h3>
        <p className="text-sm text-gray-400 mb-4">
          Definí cuántas preguntas de cada tipo le aparecerán al alumno de forma aleatoria.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <label className="flex flex-col text-sm">
            <span>Preguntas abiertas</span>
            <input
              type="number"
              min={0}
              className="border rounded px-2 py-1 bg-surface text-white"
              value={examCopy.questionLimit?.open ?? 0}
              onChange={(e) =>
                updateExamCopy({
                  questionLimit: {
                    ...examCopy.questionLimit,
                    open: Number(e.target.value),
                  },
                })
              }
            />
          </label>

          <label className="flex flex-col text-sm">
            <span>Multiple Choice</span>
            <input
              type="number"
              min={0}
              className="border rounded px-2 py-1 bg-surface text-white"
              value={examCopy.questionLimit?.choice ?? 0}
              onChange={(e) =>
                updateExamCopy({
                  questionLimit: {
                    ...examCopy.questionLimit,
                    choice: Number(e.target.value),
                  },
                })
              }
            />
          </label>

          <label className="flex flex-col text-sm">
            <span>Verdadero/Falso</span>
            <input
              type="number"
              min={0}
              className="border rounded px-2 py-1 bg-surface text-white"
              value={examCopy.questionLimit?.tof ?? 0}
              onChange={(e) =>
                updateExamCopy({
                  questionLimit: {
                    ...examCopy.questionLimit,
                    tof: Number(e.target.value),
                  },
                })
              }
            />
          </label>

          <label className="flex flex-col text-sm">
            <span>Ejercicios de código</span>
            <input
              type="number"
              min={0}
              className="border rounded px-2 py-1 bg-surface text-white"
              value={examCopy.questionLimit?.code ?? 0}
              onChange={(e) =>
                updateExamCopy({
                  questionLimit: {
                    ...examCopy.questionLimit,
                    code: Number(e.target.value),
                  },
                })
              }
            />
          </label>
        </div>
      </div>


      {/* …resto igual al ejemplo anterior… */}
      <div className="flex gap-2">
        <button
          className="btn-primary px-5 py-2"
          onClick={handleAddQuestion}
        >
          + Pregunta
        </button>
        <button
          className="btn-primary px-5 py-2"
            onClick={handleSave}
        >
          Guardar
        </button>
      </div>
    <div className="mt-6 flex flex-col gap-2">
      {examCopy.questions.map((q, index) => (
      
          <Card key={index}>
            <div className="flex items-center justify-between">
              <Pill className="text-base text-white">{q.examInstructions}</Pill>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-red-500/10 hover:text-red-400 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash3-fill"
                viewBox="0 0 16 16"
                onClick={() => {
                  updateExamCopy({
                    questions: examCopy.questions.filter((_, i) => i !== index),
                  });
                }}
              >
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
              </svg>
              </span>
            </div>
          </Card>
      
      ))}
      </div>
      </RequireRole>
    
    </>
  );
}
