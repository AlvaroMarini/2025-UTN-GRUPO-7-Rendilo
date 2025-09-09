"use client";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/exams";

export default function EditExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, updateExam } = useExamStore();
  const exam = exams.find(e => e.id === Number(id));
  if(!exam) return <p>No existe el examen.</p>;

  const addQuestion = () => {
    const q = { id: Date.now(), type: "single" as const, text: "Nueva pregunta", options: ["A","B","C","D"], correct: 0 };
    updateExam(exam.id, { questions: [...(exam.questions||[]), q] });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar examen</h1>
        <button className="text-sm underline" onClick={()=>router.push("/profes")}>Volver</button>
      </div>
      <input className="rounded-xl border px-3 py-2 w-full" value={exam.title}
             onChange={(e)=>updateExam(exam.id, { title: e.target.value })} />
      {/* …resto igual al ejemplo anterior… */}
      <div className="flex gap-2">
        <button className="rounded-full border px-4 py-2" onClick={addQuestion}>+ Pregunta</button>
        <button className="rounded-full border px-4 py-2" onClick={()=>router.push("/profes")}>Guardar</button>
      </div>
    </>
  );
}
