"use client";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useExamStore } from "@/store/exams";
import RequireRole from "@/components/requireRole";
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
  
  const finishAndSubmit = () => {
  if (submitted) return;           // evita doble envío
  setSubmitted(true);              // candado
  setActivo(false);                // frena timer si estaba corriendo
  submitAttempt(exam.id, studentId || "alumno", answers);
  router.push("/alumnos");
  setMinutos(0);
  };

  const onSubmit = () => {
    finishAndSubmit();
  };

  const [ minutos, setMinutos ] = useState<number>(() => Math.max(0, (exam?.duration ?? 0) * 60));
  const [ inicio, setInicio ]= useState<boolean>(true);
  const [ pocoTiempo, setPoco ] = useState<boolean>(false);
  const [ activo, setActivo ] = useState<boolean>(false);
  const min = Math.floor(minutos / 60);
  const seg = minutos % 60;

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
    setInicio(false);
    setActivo(true);
    document.documentElement.requestFullscreen();
  };

  return (
    <>
    { inicio ? (
    <>
    <RequireRole role="alumno"></RequireRole>
    <div className="space-y-3 py-3">
      <input
        className="border rounded px-3 py-2 w-full max-w-sm"
        placeholder="Tu ID o nombre (obligatorio)"
        value={studentId}
        onChange={(e)=>setStudentId(e.target.value)}
      />
      <button onClick={start} className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 ">Rendir</button>
    </div>
    </>
    ):(
    <>
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">{exam.title}</h1>
        <span>Tiempo Restante <span className="font-bold"/*{`${pocoTiempo ? "text-red-500 font-bold" : "text-green-500 font-bold"}`}*/>{String(min).padStart(2,'0')} : {String(seg).padStart(2,'0')}</span></span>
        <button
          className="text-sm underline self-start sm:self-auto"
          onClick={finishAndSubmit}
        >
          Finalizar
        </button>
      </div>

      {/* Progreso */}
      <p className="mb-4 text-sm sm:text-base">
        Respondidas {answers.filter((a) => a !== undefined && a !== "").length} /{" "}
        {exam.questions.length}
      </p>

      {/* Lista de preguntas */}
      <div className="space-y-6">
        {exam.questions.map((q, i) => (
          <div key={q.id} className="border p-3 sm:p-4 rounded shadow-sm">
            <p className="font-semibold mb-2 text-sm sm:text-base">
              Pregunta {i + 1}: {q.examInstructions}
            </p>

            {/* Multiple Choice (single option) */}
            {q.type === "choice" &&
              q.options.map((opt, j) => (
                <label key={j} className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={j}
                    checked={answers[i] === j}
                    onChange={() => handleChange(i, j)}
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
                    name={`q${i}`}
                    checked={answers[i] === true}
                    onChange={() => handleChange(i, true)}
                  />
                  Verdadero
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q${i}`}
                    checked={answers[i] === false}
                    onChange={() => handleChange(i, false)}
                  />
                  Falso
                </label>
              </div>
          )}

            {/* Pregunta Abierta */}
            {q.type === "open" && (
              <textarea
                className="w-full border p-2 rounded text-sm sm:text-base"
                rows={3}
                value={answers[i] || ""}  
                onChange={(e) => handleChange(i, e.target.value)}
              />
            )}

          </div>
        ))}
      </div>

      {/* Botón de envío */}
      <button
        className="mt-6 w-full sm:w-auto rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base"
        onClick={onSubmit}
      >
        Enviar
      </button>
    </div>
    </>
      )
    }
    </>
  );
  
}
