"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useExamStore } from "@/store/exams";
import RequireRole from "@/components/requireRole";
import CameraNoticeModal from "@/components/ui/CameraNoticeModal";
import { useCamera } from "@/hook/useCamera";
import { useCameraStore } from "@/store/camera";

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

  const { videoRef, startCamera, stopCamera } = useCamera();
  const { preferredDeviceId } = useCameraStore();

  const finishAndSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    setActivo(false);
    const orderedAnswers = questionOrder.map((i) => answers[i]);
    submitAttempt(exam.id, studentId || "alumno", orderedAnswers);
    // stopCamera();
    router.push("/alumnos");
    setMinutos(0);
  };

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

  const start = () => {
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
  };

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
              className="px-6 py-1 bg-blue-700 rounded-lg hover:bg-blue-900 "
            >
              Rendir
            </button>
          </div>
        </RequireRole>
      ) : (
        <RequireRole role="alumno">
          <div className="p-6">

            {/* Cámara */}
            <div
              className="fixed left-3 top-[84px] w-[320px] h-[240px]
                md:left-6 md:top-[96px] md:w-[360px] md:h-[270px]
                rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10 z-40"
            >
              <video
                className="w-full h-full object-cover pointer-events-none"
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
                ref={videoRef}
                id="inputvideo"
                autoPlay
                muted
                playsInline
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {exam.title}
              </h1>
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

            {/* Pregunta actual */}
            <div className="space-y-6">
              {q && (
                <div key={q.id} className="border p-3 sm:p-4 rounded shadow-sm">
                  <p className="font-semibold mb-2 text-sm sm:text-base">
                    Pregunta {currentIndex + 1} de {exam.questions.length}:{" "}
                    {q.examInstructions}
                  </p>

                  {/* Multiple Choice */}
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
                        <span className="text-sm sm:text-base">
                          {opt.text}
                        </span>
                      </label>
                    ))}

                  {/* Verdadero / Falso */}
                  {q.type === "tof" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q${currentQuestionIndex}`}
                          checked={answers[currentQuestionIndex] === true}
                          onChange={() =>
                            handleChange(currentQuestionIndex, true)
                          }
                        />
                        Verdadero
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`q${currentQuestionIndex}`}
                          checked={answers[currentQuestionIndex] === false}
                          onChange={() =>
                            handleChange(currentQuestionIndex, false)
                          }
                        />
                        Falso
                      </label>
                    </div>
                  )}

                  {/* Abierta */}
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

                  {/* 💻 Pregunta de código */}
                  {q.type === "code" && (
                    <div className="mt-4 space-y-3">
                      {/* Código */}
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

                      {/* Lenguaje */}
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

                      {/* Entrada (stdin) */}
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

                      {/* Botón */}
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

                      {/* Terminal */}
                      <div className="bg-black text-green-400 font-mono p-3 rounded h-40 overflow-auto">
                        <pre>
                          {answers[currentQuestionIndex]?.output ||
                            "Salida aparecerá aquí..."}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón siguiente */}
            <div className="flex justify-end mt-6">
              <button
                className="rounded-full border px-4 py-2 bg-green-600 text-white text-sm sm:text-base"
                onClick={siguientePregunta}
              >
                {currentIndex + 1 === exam.questions.length
                  ? "Finalizar"
                  : "Siguiente"}
              </button>
            </div>
          </div>
        </RequireRole>
      )}
    </>
  );
}
