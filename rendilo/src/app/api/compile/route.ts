import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
    const { code, language_id } = await req.json();
    console.log("API KEY:", process.env.JUDGE0_API_KEY);


    if (!code || !language_id) {
        return NextResponse.json(
            { error: "Faltan parámetros 'code' o 'language_id'." },
            { status: 400 }
        );
    }

    const submission = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
        {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": process.env.JUDGE0_API_KEY as string,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
            source_code: code,
            language_id: Number(language_id),
            stdin: "",
        }),
        }
    );

    const result = await submission.json();

    // Log para depurar en consola del servidor
    console.log("Judge0 response:", result);

    // Devuelve lo importante
    return NextResponse.json({
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        message: result.message,
        status: result.status?.description,
    });
    } catch (error) {
        console.error("Error al compilar:", error);
        return NextResponse.json(
            { error: "Error interno al compilar el código." },
            { status: 500 }
        );
    }
}
