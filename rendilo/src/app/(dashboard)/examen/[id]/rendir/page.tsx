// "use client";
// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { useExamStore } from "@/store/exams";

// export default function TakeExam() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();
//   const { exams, submitAttempt } = useExamStore();
//   const exam = exams.find(e => e.id === Number(id));
//   const [answers, setAnswers] = useState<number[]>(() => (exam?.questions || []).map(()=>-1));
//   if(!exam) return <p>No existe el examen.</p>;

//   const onSubmit = () => {
//     const score = submitAttempt(exam.id, answers);
//     alert(`Tu puntaje: ${score}/${(exam.questions||[]).length || 10}`);
//     router.push("/alumnos");
//   };

//   return (
//     <>
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">{exam.title}</h1>
//         <button className="text-sm underline" onClick={()=>router.push("/alumnos")}>Salir</button>
//       </div>
//       {/* …resto igual al ejemplo anterior… */}
//       <button className="rounded-full border px-4 py-2" onClick={onSubmit}>Enviar</button>
//     </>
//   );
// }

"use client";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useExamStore } from "@/store/exams";
//import { clearInterval } from "timers";
//Tiempo Inicial de 2 Minutos para pruebas
let tiempo = 1;
export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, submitAttempt } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));

  // Inicializa respuestas
  const [answers, setAnswers] = useState<any[]>([]);

  if (!exam) return <p>No existe el examen.</p>;
  //if (exam.questions.length === 0) return <p>Este examen no tiene preguntas aún.</p>;

  const handleChange = (index: number, value: any) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const onSubmit = () => {
    router.push("/alumnos");
    setMinutos(0);
  };

  const [ minutos, setMinutos ] = useState( tiempo * 60 );
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
    if( minutos === 0 ){
      //
      setMinutos(0);
      setActivo(false);
      //const score = submitAttempt(exam.id, answers);
      //Eliminar comentarios para probar
      const score = 5;
      alert(`Tu puntaje: ${score}/10`);
      console.log("UseEffect");
      router.push("/alumnos");
    }
    if( min<1 ){
      setPoco(true);
    }

  },[ minutos ]);

  const start = ()=>{
    setInicio(false);
    setActivo(true);
    document.documentElement.requestFullscreen();
  };

  return (
    <>
    { inicio ? (
    <>
    <div className="py-3">
      <button onClick={start} className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 ">Rendir</button>
    </div>
    </>
    ):(
    <>
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">{exam.title}</h1>
        <span>Tiempo Restante <span className={`${pocoTiempo ? "text-red-500 font-bold" : "text-green-500 font-bold"}`}>{String(min).padStart(2,'0')} : {String(seg).padStart(2,'0')}</span></span>
        <button
          className="text-sm underline self-start sm:self-auto"
          onClick={() => router.push("/alumnos")}
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
