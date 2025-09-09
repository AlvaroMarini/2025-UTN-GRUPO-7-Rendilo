import React, { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useExamStore } from "../store/exams";

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exams, updateExam } = useExamStore();
  const exam = useMemo(()=> exams.find(e=> e.id === Number(id)), [exams, id]);

  if(!exam) return <p>No existe el examen.</p>;

  const addQuestion = () => {
    const q = { id: Date.now(), type: "single", text: "Nueva pregunta", options: ["A","B","C","D"], correct: 0 };
    updateExam(exam.id, { questions: [...(exam.questions || []), q] });
  };

  const updateTitle = (t) => updateExam(exam.id, { title: t });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar examen</h1>
        <Link to="/profes" className="text-sm underline">Volver</Link>
      </div>

      <input className="rounded-xl border px-3 py-2 w-full" value={exam.title} onChange={(e)=>updateTitle(e.target.value)} />

      <div className="space-y-3">
        {(exam.questions || []).map((q, idx) => (
          <div key={q.id} className="rounded-xl border p-3">
            <div className="mb-2 font-medium">Pregunta {idx+1}</div>
            <input className="rounded-lg border px-3 py-2 w-full mb-2"
                   value={q.text}
                   onChange={(e)=> {
                     const qs = [...exam.questions];
                     qs[idx] = { ...q, text: e.target.value };
                     updateExam(exam.id, { questions: qs });
                   }} />
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-1">
                <input type="radio" name={`q${q.id}`} checked={q.correct===i}
                       onChange={()=> {
                         const qs = [...exam.questions];
                         qs[idx] = { ...q, correct: i };
                         updateExam(exam.id, { questions: qs });
                       }}/>
                <input className="rounded border px-2 py-1 flex-1" value={opt}
                       onChange={(e)=> {
                         const qs = [...exam.questions];
                         const opts = [...q.options]; opts[i] = e.target.value;
                         qs[idx] = { ...q, options: opts };
                         updateExam(exam.id, { questions: qs });
                       }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="rounded-full border px-4 py-2" onClick={addQuestion}>+ Pregunta</button>
        <button className="rounded-full border px-4 py-2" onClick={()=>navigate("/profes")}>Guardar</button>
      </div>
    </section>
  );
}
