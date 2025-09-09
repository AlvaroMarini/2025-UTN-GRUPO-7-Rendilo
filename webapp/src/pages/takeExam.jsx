import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useExamStore } from "../store/exams";

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, submitAttempt } = useExamStore();
  const exam = useMemo(()=> exams.find(e=> e.id === Number(id)), [exams, id]);
  const [answers, setAnswers] = useState(() => (exam?.questions || []).map(()=>null));

  if(!exam) return <p>No existe el examen.</p>;

  const onSubmit = () => {
    const score = submitAttempt(exam.id, answers);
    alert(`Tu puntaje: ${score}/${exam.questions.length || 10}`);
    navigate("/alumnos");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{exam.title}</h1>
        <Link to="/alumnos" className="text-sm underline">Salir</Link>
      </div>

      {(exam.questions||[]).length === 0 && <p>Este examen aún no tiene preguntas.</p>}

      {(exam.questions||[]).map((q, idx)=>(
        <div key={q.id} className="rounded-xl border p-3">
          <div className="mb-2 font-medium">{idx+1}. {q.text}</div>
          {q.options.map((opt, i)=>(
            <label key={i} className="flex items-center gap-2 mb-1">
              <input type="radio" name={`q${q.id}`} checked={answers[idx]===i}
                     onChange={()=> {
                       const a = [...answers]; a[idx]=i; setAnswers(a);
                     }}/>
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}

      <button className="rounded-full border px-4 py-2" onClick={onSubmit}>Enviar</button>
    </section>
  );
}
