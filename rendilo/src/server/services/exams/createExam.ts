import { examRepo } from "@/server/repositories/exams/InMemoryExamRepo";
export async function createExam(title:string){ return examRepo.create(title); }
