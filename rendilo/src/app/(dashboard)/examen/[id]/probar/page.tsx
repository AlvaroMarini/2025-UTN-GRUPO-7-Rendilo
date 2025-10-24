"use client";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { useExamStore } from "@/store/exams";
import RequireRole from "@/components/requireRole";

import CameraNoticeModal from "@/components/ui/CameraNoticeModal";
import { useCamera } from "@/hook/useCamera";
import { useCameraStore } from "@/store/camera";

//import { clearInterval } from "timers";
//Tiempo Inicial de 2 Minutos para pruebas

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, submitAttempt } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));

  // Inicializa respuestas
  const [answers, setAnswers] = useState<any[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  if (!exam) return <p>No existe el examen.</p>;
  //if (exam.questions.length === 0) return <p>Este examen no tiene preguntas aún.</p>;

  const handleChange = (index: number, value: any) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };
  

const [showCamNotice, setShowCamNotice] = useState(false);

  
  const finishAndSubmit = () => {
  if (submitted) return;           // evita doble envío
  setSubmitted(true);              // candado
  setActivo(false);                // frena timer si estaba corriendo
  stopCamera(); 
  //submitAttempt(exam.id, studentId || "alumno", answers);
  router.push("/profesores");
  setMinutos(0);
  };

  const onSubmit = () => {
    finishAndSubmit();
  };

  const [ minutos, setMinutos ] = useState<number>(() => Math.max(0, (exam?.duration ?? 0) * 60));
  const [ inicio, setInicio ]= useState<boolean>(true);
  const [ pocoTiempo, setPoco ] = useState<boolean>(false);
  const [ activo, setActivo ] = useState<boolean>(false);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const min = Math.floor(minutos / 60);
  const seg = minutos % 60;
  const currentQuestionIndex = questionOrder[currentIndex];
  const q = exam.questions[currentQuestionIndex];

  

  const mezclarPreguntas = () => {
  const order = exam.questions.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  setQuestionOrder(order);
  };
  const siguientePregunta = () => {
  if (currentIndex + 1 < exam.questions.length) {
    setCurrentIndex(currentIndex + 1);
  } else {
    finishAndSubmit();
  }
};
const anteriorPregunta = () => {
    if (currentIndex - 1 >= 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };


const { videoRef, camOn, error, startCamera, stopCamera } = useCamera();
const { preferredDeviceId } = useCameraStore();

  useEffect(()=>{
    let intervalo: NodeJS.Timeout | null = null;
    if(activo){
      intervalo = setInterval(()=>{
      setMinutos(prev =>{
        return prev-1;
      });
    },1000);
    }else{
      if(intervalo)
        clearInterval(intervalo);
    }
    return ()=>{
      if(intervalo) clearInterval(intervalo);
    }
  },[ activo ]);

  useEffect(()=>{
    if (submitted) return;           
      if (minutos === 0) {
        finishAndSubmit();              
      } 
      if (min < 1) setPoco(true);
  }, [minutos, submitted]);


  const start = ()=>{
    // Inicializar respuestas acorde a tipos
    const init = (exam?.questions || []).map((q: any) => {
      if (q.type === "choice") return -1;
      if (q.type === "tof") return null;
      return ""; // open
    });
    setAnswers(init);
    setMinutos(Math.max(0, (exam?.duration ?? 0) * 60));
    mezclarPreguntas()
    setInicio(false);
    setShowCamNotice(true);
    setActivo(true); 
  };

  return (
    <>
    { inicio ? (
    <>
    <RequireRole role="profesor">

    <div className="space-y-3 py-3">
    
      <button onClick={start} className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 ">Iniciar prueba</button>
    </div>
    </RequireRole>
    </>
    ):(
    <>
    <RequireRole role="profesor">
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">{exam.title}</h1>
        <span>Tiempo Restante <span className="font-bold"/*{`${pocoTiempo ? "text-red-500 font-bold" : "text-green-500 font-bold"}`}*/>{String(min).padStart(2,'0')} : {String(seg).padStart(2,'0')}</span></span>
        <button
          className="px-4 py-2 text-sm self-start sm:self-auto cursor-pointer hover:bg-indigo-600 rounded-full"
          onClick={finishAndSubmit}
        >
          Finalizar prueba
        </button>
      </div>

     {/* Pregunta actual */}
    <div className="space-y-6">
  {q && (
    <div key={q.id} className="border p-3 sm:p-4 rounded shadow-sm">
      <p className="font-semibold mb-2 text-sm sm:text-base">
        Pregunta {currentIndex + 1} de {exam.questions.length}:{" "}
        {q.examInstructions}
      </p>

      {/* Multiple Choice (una opción) */}
      {q.type === "choice" &&
        q.options.map((opt, j) => (
          <label key={j} className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name={`q${currentQuestionIndex}`}
              value={j}
              checked={answers[currentQuestionIndex] === j}
              onChange={() => handleChange(currentQuestionIndex, j)}
            />
            <span className="text-sm sm:text-base">{opt.text}</span>
          </label>
        ))}

      {/* Verdadero/Falso */}
      {q.type === "tof" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`q${currentQuestionIndex}`}
              checked={answers[currentQuestionIndex] === true}
              onChange={() => handleChange(currentQuestionIndex, true)}
            />
            Verdadero
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`q${currentQuestionIndex}`}
              checked={answers[currentQuestionIndex] === false}
              onChange={() => handleChange(currentQuestionIndex, false)}
            />
            Falso
          </label>
        </div>
      )}

      {/* Pregunta abierta */}
      {q.type === "open" && (
        <textarea
          className="w-full border p-2 rounded text-sm sm:text-base"
          rows={3}
          value={answers[currentQuestionIndex] || ""}
          onChange={(e) =>
            handleChange(currentQuestionIndex, e.target.value)
          }
        />
      )}

      {q.type === "code" && (
                    <div className="mt-4 space-y-3">
                      <textarea
                        className="w-full border p-2 rounded font-mono bg-gray-900 text-green-200 text-sm sm:text-base"
                        rows={8}
                        placeholder="Escribí tu código aquí..."
                        value={answers[currentQuestionIndex]?.code || ""}
                        onChange={(e) =>
                          handleChange(currentQuestionIndex, {
                            ...(answers[currentQuestionIndex] || {}),
                            code: e.target.value,
                          })
                        }
                      />

                      <select
                        className="border rounded p-2 bg-gray-800 text-white"
                        value={answers[currentQuestionIndex]?.language_id || 50}
                        onChange={(e) =>
                          handleChange(currentQuestionIndex, {
                            ...(answers[currentQuestionIndex] || {}),
                            language_id: Number(e.target.value),
                          })
                        }
                      >
                        <option value="50">C (GCC 9.2.0)</option>
                        <option value="54">C++ (GCC 9.2.0)</option>
                        <option value="62">Java (OpenJDK 13)</option>
                        <option value="63">JavaScript (Node.js 12.14.0)</option>
                        <option value="71">Python (3.8.1)</option>
                      </select>

                      <textarea
                        className="w-full border p-2 rounded font-mono bg-gray-950 text-gray-100"
                        rows={3}
                        placeholder="Entrada (stdin)... ej: valores para scanf o input"
                        value={answers[currentQuestionIndex]?.stdin || ""}
                        onChange={(e) =>
                          handleChange(currentQuestionIndex, {
                            ...(answers[currentQuestionIndex] || {}),
                            stdin: e.target.value,
                          })
                        }
                      />

                      <button
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={async () => {
                          const current = answers[currentQuestionIndex] || {};
                          const res = await fetch("/api/compile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              code: current.code,
                              language_id: current.language_id || 50,
                              stdin: current.stdin || "",
                            }),
                          });
                          const data = await res.json();

                          handleChange(currentQuestionIndex, {
                            ...current,
                            output:
                              data.stdout ||
                              data.stderr ||
                              data.compile_output ||
                              "Sin salida",
                          });
                        }}
                      >
                        Compilar y Ejecutar
                      </button>

                      <div className="bg-black text-green-400 font-mono p-3 rounded h-40 overflow-auto">
                        <pre>
                          {answers[currentQuestionIndex]?.output || "Salida aparecerá aquí..."}
                        </pre>
                      </div>
                    </div>
                  )}
    </div>
  )}
    </div>

{/* Botón siguiente / finalizar */}
  <div className="flex justify-between mt-6">
    {currentIndex - 1 >= 0 && <button
                className="rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base"
                onClick={anteriorPregunta}
              >
              Anterior
              </button>}
    <button
    className="rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base hover:bg-green-800 cursor-pointer"
    onClick={siguientePregunta}
    >
    {currentIndex + 1 === exam.questions.length ? "Finalizar" : "Siguiente"}
    </button>
  </div>
  </div>
    </RequireRole>
    </>
      )
    }
  </>
  );
  
}