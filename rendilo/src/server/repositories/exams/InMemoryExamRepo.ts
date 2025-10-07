import { IExamRepo } from "./IExamRepo";
import { Exam, Attempt } from "@/server/domain/exam";

let seqExam = 2, seqAttempt = 1;
const db: Exam[] = [
  { id: 1, title: "Examen 1", published: true, questions: [], attempts: [], lastScore: null, needsReview: false },
];

export class InMemoryExamRepo implements IExamRepo {
  async list(){ return structuredClone(db); }
  async get(id:number){ return structuredClone(db.find(e=>e.id===id) ?? null); }
  async create(title:string){
    const e:Exam={ id: ++seqExam, title, published:false, questions:[], attempts:[], lastScore:null, needsReview:false };
    db.push(e); return structuredClone(e);
  }
  async update(id:number, patch:Partial<Exam>){
    const i=db.findIndex(e=>e.id===id); if(i<0) throw new Error("not found");
    db[i] = { ...db[i], ...patch }; return structuredClone(db[i]);
  }
  async delete(id:number){ const i=db.findIndex(e=>e.id===id); if(i<0) return; db.splice(i,1); }
  async addAttempt(examId:number, studentId:string, answers:any[]){
    const e=db.find(e=>e.id===examId); if(!e) throw new Error("not found");
    const at:Attempt={ id: ++seqAttempt, studentId, answers, autoScore: null, manualMarks:{}, finalScore:null, completed:false };
    e.attempts.push(at); e.needsReview = true; return structuredClone(at);
  }
  async reviewAttempt(examId:number, attemptId:number, manualMarks:Record<number,boolean>){
    const e=db.find(e=>e.id===examId); if(!e) throw new Error("not found");
    const a=e.attempts.find(a=>a.id===attemptId); if(!a) throw new Error("not found");
    a.manualMarks = { ...a.manualMarks, ...manualMarks };
    const manualScore = Object.values(a.manualMarks).filter(Boolean).length;
    a.finalScore = (a.autoScore ?? 0) + manualScore;
    a.completed = true;
    e.needsReview = e.attempts.some(x => !x.completed);
    return structuredClone(a);
  }
}
export const examRepo = new InMemoryExamRepo();
