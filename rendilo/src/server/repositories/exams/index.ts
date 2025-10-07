// DB ARRIBA
//import { PrismaExamRepo } from "./PrismaExamRepo.ts";
//export const examRepo = new PrismaExamRepo();

// DB ABAJO
import { InMemoryExamRepo } from "./InMemoryExamRepo";
export const examRepo = new InMemoryExamRepo();