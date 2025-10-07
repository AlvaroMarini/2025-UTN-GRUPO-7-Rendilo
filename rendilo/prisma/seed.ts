import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Usuarios demo
  await prisma.user.upsert({
    where: { email: "alumno@demo.com" },
    update: {},
    create: { email: "alumno@demo.com", password: "123", role: "student" },
  });
  await prisma.user.upsert({
    where: { email: "profe@demo.com" },
    update: {},
    create: { email: "profe@demo.com", password: "123", role: "teacher" },
  });

  // Examen + preguntas
  const exam = await prisma.exam.create({
    data: { title: "Examen 1", description: "Demo", published: true, duration: 30 }
  });

  await prisma.question.createMany({
    data: [
      { examId: exam.id, type: "tof",   examInstructions: "La Tierra es plana", tof: false },
      { examId: exam.id, type: "open",  examInstructions: "Explique brevemente la fotosíntesis" },
      { examId: exam.id, type: "choice",examInstructions: "Capital de Francia", options: [{text:"París",isCorrect:true},{text:"Roma",isCorrect:false}] }
    ]
  });
}

main().finally(() => prisma.$disconnect());
