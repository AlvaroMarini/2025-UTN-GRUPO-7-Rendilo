"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, submitAttempt } = useExamStore();
  const exam = exams.find((e) => e.id === Number(id));

  const [answers, setAnswers] = useState<Record<string | number, any>>({});
  const [studentId, setStudentId] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [showCamNotice, setShowCamNotice] = useState(false);
  const [minutos, setMinutos] = useState<number>(() =>
    Math.max(0, (exam?.duration ?? 0) * 60)
  );
  const [inicio, setInicio] = useState<boolean>(true);
  const [pocoTiempo, setPoco] = useState<boolean>(false);
  const [activo, setActivo] = useState<boolean>(false);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFaceWarning, setShowFaceWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [cameraReady, setCameraReady] = useState(false);
  const [showMultiFaceWarning, setShowMultiFaceWarning] = useState(false);
  const [ignoreFocus, setIgnoreFocus] = useState(false);
  const [screenWidth, setScreenWidth] = useState<number | null>(null);

  const { videoRef, camOn, error, startCamera, stopCamera, faceCount } = useCamera();
  const { preferredDeviceId } = useCameraStore();

  if (!exam) return <p>No existe el examen.</p>;

  const min = Math.floor(minutos / 60);
  const seg = minutos % 60;
  const currentQuestionIndex = questionOrder[currentIndex];
  const q = exam.questions[currentQuestionIndex];

  const handleChange = (index: string | number, value: any) => {
    const updated = { ...answers };
    updated[index] = value;
    setAnswers(updated);
  };

  const finishAndSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    setActivo(false);
    const orderedAnswers = questionOrder.map((i) => answers[i]);
    submitAttempt(exam.id, studentId || "alumno", orderedAnswers);
    router.push("/alumnos");
    setMinutos(0);
  };

  const { showExitModal, confirmExit, cancelExit, showAutoSubmitFocusModal } = useExamSecurity({
    submitted,
    startProtection: !inicio,
    finishAndSubmit,
    ignoreFocus
  });

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

  const start = async () => {
    const init = (exam?.questions || []).map((q: any) => {
      if (q.type === "choice") return -1;
      if (q.type === "tof") return null;
      return "";
    });
    setAnswers(init);
    setMinutos(Math.max(0, (exam?.duration ?? 0) * 60));
    mezclarPreguntas();
    setInicio(false);
    setShowCamNotice(true);
    setActivo(true);

    try {
      await document.documentElement.requestFullscreen();

      if (exam.withCamera) {
        setIgnoreFocus(true);
        await startCamera({ deviceId: preferredDeviceId });
        setTimeout(() => setIgnoreFocus(false), 2000);
      }
    } catch (err) {
      console.error("Error al iniciar fullscreen o cámara:", err);
      setIgnoreFocus(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    let intervalo: NodeJS.Timeout | null = null;
    if (activo) {
      intervalo = setInterval(() => {
        setMinutos((prev) => prev - 1);
      }, 1000);
    } else if (intervalo) clearInterval(intervalo);

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [activo]);

  useEffect(() => {
    if (submitted) return;
    if (minutos === 0) finishAndSubmit();
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

    if (faceCount > 1 && !showMultiFaceWarning) {
      setShowMultiFaceWarning(true);
      setShowFaceWarning(false);
      setCountdown(0);

      setTimeout(() => {
        finishAndSubmit();
      }, 2500);
    }

    if (faceCount === 0 && !showFaceWarning && !showMultiFaceWarning) {
      setShowFaceWarning(true);
      setCountdown(10);

      intervalRef = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef!);
            setShowFaceWarning(false);
            finishAndSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (faceCount === 1 && (showFaceWarning || showMultiFaceWarning)) {
      setShowFaceWarning(false);
      setShowMultiFaceWarning(false);
      setCountdown(10);
    }

    return () => {
      if (intervalRef) clearInterval(intervalRef);
    };
  }, [faceCount, cameraReady, exam.withCamera, submitted]);

  return (
    <>
      {inicio ? (
        <RequireRole role="alumno">
          <div className="space-y-3 py-3">
            <input
              className="border rounded px-3 py-2 w-full max-w-sm"
              placeholder="Tu ID o nombre (obligatorio)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
            <button
              onClick={start}
              className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900"
            >
              Rendir
            </button>
          </div>
        </RequireRole>
      ) : (
        <RequireRole role="alumno">
          <div className="p-6">
            {exam.withCamera && (
              <div
                className={`
                  fixed z-40 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl
                  transition-all duration-300
                  ${
                    screenWidth && screenWidth < 640
                      ? "right-3 top-24 w-[180px] h-[135px]"
                      : "left-4 bottom-4 w-[220px] h-[160px]"
                  }
                `}
              >
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

            {exam.withCamera && (
              <div className="fixed bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                {faceCount === 0 && <p className="text-red-500">No se detecta ningún rostro</p>}
                {faceCount > 1 && <p className="text-yellow-400">Se detectan múltiples rostros</p>}
                {faceCount === 1 && <p className="text-green-400">Rostro detectado</p>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold">{exam.title}</h1>
              <span>
                Tiempo Restante{" "}
                <span className="font-bold">
                  {String(min).padStart(2, "0")} : {String(seg).padStart(2, "0")}
                </span>
              </span>
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
                await startCamera({ deviceId: preferredDeviceId });
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

            <div className="space-y-6">
              {q && (
                <div key={q.id} className="border p-3 sm:p-4 rounded shadow-sm">
                  <p className="font-semibold mb-2 text-sm sm:text-base">
                    Pregunta {currentIndex + 1} de {exam.questions.length}: {q.examInstructions}
                  </p>

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

                  {q.type === "open" && (
                    <textarea
                      className="w-full border p-2 rounded text-sm sm:text-base"
                      rows={3}
                      value={answers[currentQuestionIndex] || ""}
                      onChange={(e) => handleChange(currentQuestionIndex, e.target.value)}
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

            <div className="flex justify-end mt-6">
              <button
                className="rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base"
                onClick={siguientePregunta}
              >
                {currentIndex + 1 === exam.questions.length ? "Finalizar" : "Siguiente"}
              </button>
            </div>
          </div>
        </RequireRole>
      )}
    </>
  );
}