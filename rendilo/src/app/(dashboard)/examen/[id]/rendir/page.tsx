"use client";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

import { useExamStore } from "@/store/exams";
import RequireRole from "@/components/requireRole";

import CameraNoticeModal from "@/components/ui/CameraNoticeModal";
import { useCamera } from "@/hook/useCamera";
import { useCameraStore } from "@/store/camera";

import FaceWarningModal from "@/components/ui/FaceWarningModal";
import MultiFaceModal from "@/components/ui/MultiFaceModal";



import { useExamSecurity } from "@/hook/useExamSecurity";
import AutoSubmitFocusModal from "@/components/ui/AutoSubmitFocusModal";
import ExitExamModal from "@/components/ui/ExitExamModal";
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
  if (exam.questions.length === 0) return <p>Este examen no tiene preguntas aún.</p>;

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

const [showFaceWarning, setShowFaceWarning] = useState(false);
const [countdown, setCountdown] = useState(10);
const [cameraReady, setCameraReady] = useState(false);
const [showMultiFaceWarning, setShowMultiFaceWarning] = useState(false);
const [ignoreFocus, setIgnoreFocus] = useState(false);

const {showExitModal,confirmExit,cancelExit,showAutoSubmitFocusModal,} = useExamSecurity({submitted,startProtection: !inicio,finishAndSubmit,ignoreFocus});

const { videoRef, camOn, error, startCamera, stopCamera, faceCount } = useCamera();
const { preferredDeviceId } = useCameraStore();

const [screenWidth, setScreenWidth] = useState<number | null>(null);

useEffect(() => {
  if (typeof window !== "undefined") {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }
}, []);


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

useEffect(() => {
    if (camOn) {
      const t = setTimeout(() => setCameraReady(true), 3000);
      return () => clearTimeout(t);
    } else {
      setCameraReady(false);
    }
  }, [camOn]);


useEffect(() => {
  if (!exam.withCamera || submitted || !cameraReady) return;

  let intervalRef: NodeJS.Timeout | null = null;

  // Caso: múltiples rostros → enviar de inmediato
  if (faceCount > 1 && !showMultiFaceWarning) {
    setShowMultiFaceWarning(true);
    setShowFaceWarning(false);
    setCountdown(0);

    setTimeout(() => {
      finishAndSubmit(); // Enviar inmediatamente
    }, 2500);
  }

  // Caso: no hay rostro → cuenta regresiva
  if (faceCount === 0 && !showFaceWarning && !showMultiFaceWarning) {
    setShowFaceWarning(true);
    setCountdown(10);

    intervalRef = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef!);
          setShowFaceWarning(false);
          finishAndSubmit(); // Enviar después de 10s
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Caso: vuelve rostro normal
  if (faceCount === 1 && (showFaceWarning || showMultiFaceWarning)) {
    setShowFaceWarning(false);
    setShowMultiFaceWarning(false);
    setCountdown(10);
  }

  return () => {
    if (intervalRef) clearInterval(intervalRef);
  };
}, [faceCount, cameraReady, exam.withCamera, submitted]);

  const start = async  ()=>{
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
    setActivo(true); 
   try {
  await document.documentElement.requestFullscreen();

  if (exam.withCamera) {
    // Ignoramos temporalmente la detección de foco
    setIgnoreFocus(true);
    await startCamera({ deviceId: preferredDeviceId });
    // Esperamos 2 segundos para estabilizar permisos
    setTimeout(() => setIgnoreFocus(false), 2000);
  }
} catch (err) {
  console.error("Error al iniciar fullscreen o cámara:", err);
  setIgnoreFocus(false);
}

  };

  return (
    <>
    { inicio ? (
    <>
    <RequireRole role="alumno">

    <div className="space-y-3 py-3">
      <input
        className="border rounded px-3 py-2 w-full max-w-sm"
        placeholder="Tu ID o nombre (obligatorio)"
        value={studentId}
        onChange={(e)=>setStudentId(e.target.value)}
      />
      <button onClick={start} className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 ">Rendir</button>
    </div>
    </RequireRole>
    </>
    ):(
    <>
    <RequireRole role="alumno">
    <div className="p-6">
      {exam.withCamera && (
            <div
            className={`
            fixed z-40 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl
            transition-all duration-300
            ${screenWidth && screenWidth < 640
            ? "right-3 top-24 w-[180px] h-[135px]" // móvil
            : "left-4 bottom-4 w-[220px] h-[160px]" // desktop
            }`}>
    <video
      className="w-full h-full object-cover pointer-events-none"
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
      ref={videoRef}
      autoPlay
      muted
      playsInline
      onContextMenu={(e) => e.preventDefault()}
    />
  </div>
)}


            
    {/* Indicador de detección facial */}
{exam.withCamera && (
  <div className="fixed bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg z-50">
    {faceCount === 0 && <p className="text-red-500">No se detecta ningún rostro</p>}
    {faceCount > 1 && <p className="text-yellow-400">Se detectan múltiples rostros</p>}
    {faceCount === 1 && <p className="text-green-400">Rostro detectado</p>}
  </div>
)}

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

  <CameraNoticeModal
    visible={showCamNotice}
    onAccept={async () => {
      setShowCamNotice(false);
      document.documentElement.requestFullscreen().catch(() => {});
      await startCamera({ deviceId: preferredDeviceId }); // o sin parámetro si no usás store
    }}
    onCancel={() => setShowCamNotice(false)}
  />

<FaceWarningModal visible={showFaceWarning} countdown={countdown} />
<MultiFaceModal visible={showMultiFaceWarning} />

<ExitExamModal
  visible={showExitModal}
  onConfirm={confirmExit}
  onCancel={cancelExit}
/>
<AutoSubmitFocusModal visible={showAutoSubmitFocusModal} />



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
    className="rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base"
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

