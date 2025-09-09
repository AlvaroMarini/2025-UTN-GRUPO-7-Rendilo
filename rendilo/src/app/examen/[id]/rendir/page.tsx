"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useExamStore } from "@/store/exams";

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { exams, submitAttempt } = useExamStore();
  const exam = exams.find(e => e.id === Number(id));
  const [answers, setAnswers] = useState<number[]>(() => (exam?.questions || []).map(()=>-1));
  if(!exam) return <p>No existe el examen.</p>;

  const onSubmit = () => {
    const score = submitAttempt(exam.id, answers);
    alert(`Tu puntaje: ${score}/${(exam.questions||[]).length || 10}`);
    router.push("/alumnos");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        <button className="text-sm underline" onClick={()=>router.push("/alumnos")}>Salir</button>
      </div>
      {/* …resto igual al ejemplo anterior… */}
      <button className="rounded-full border px-4 py-2" onClick={onSubmit}>Enviar</button>
    </>
  );
}
