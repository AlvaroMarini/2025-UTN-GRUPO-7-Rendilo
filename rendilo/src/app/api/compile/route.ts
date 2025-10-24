import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language_id, stdin } = await req.json();
    console.log("API KEY:", process.env.JUDGE0_API_KEY);

    if (!code || !language_id) {
      return NextResponse.json(
        { error: "Faltan parámetros 'code' o 'language_id'." },
        { status: 400 }
      );
    }

    // Codificar código y entrada en base64 (evita errores UTF-8)
    const encodeBase64 = (str: string) =>
      Buffer.from(str, "utf-8").toString("base64");

    const submission = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY as string,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: encodeBase64(code),
          language_id: Number(language_id),
          stdin: encodeBase64(stdin || ""),
        }),
      }
    );

    const result = await submission.json();

    // Decodificar los valores que vienen en base64 (Judge0 los devuelve así)
    const decodeBase64 = (b64?: string) =>
      b64 ? Buffer.from(b64, "base64").toString("utf-8") : null;

    const response = {
      stdout: decodeBase64(result.stdout),
      stderr: decodeBase64(result.stderr),
      compile_output: decodeBase64(result.compile_output),
      message: result.message,
      status: result.status?.description,
    };

    console.log("Judge0 response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al compilar:", error);
    return NextResponse.json(
      { error: "Error interno al compilar el código." },
      { status: 500 }
    );
  }
}
