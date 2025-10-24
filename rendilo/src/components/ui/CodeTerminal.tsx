"use client";
import { useState } from "react";

interface CodeTerminalProps {
  code: string;
  languageId: string;
}

export default function CodeTerminal({ code, languageId }: CodeTerminalProps) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState<string>("Salida aparecerá aquí...");
    const [isRunning, setIsRunning] = useState(false);

    const runCode = async () => {
        if (!code.trim()) {
        setOutput("⚠️ No hay código para ejecutar.");
        return;
        }

    setIsRunning(true);
    setOutput("🟡 Compilando y ejecutando...");

    try {
        const res = await fetch("/api/compile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            code,
            language_id: Number(languageId),
            stdin: input,
            }),
        });

        const data = await res.json();

        if (data.error) {
            setOutput(`Error: ${data.error}`);
        } else if (data.stderr) {
            setOutput(`Error de ejecución:\n${data.stderr}`);
        } else if (data.compile_output) {
            setOutput(`Error de compilación:\n${data.compile_output}`);
        } else if (data.stdout) {
            setOutput(data.stdout);
        } else {
            setOutput("Sin salida (posible error lógico)");
        }
        } catch (err) {
        setOutput(`Error de red: ${err}`);
        } finally {
        setIsRunning(false);
        }
    };

    return (
        <div className="mt-4 space-y-3">
            {/* Input para stdin */}
            <textarea
                className="w-full border border-gray-600 bg-black text-green-400 rounded font-mono text-sm p-2"
                rows={2}
                placeholder="Entrada (stdin)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />

            {/* Botón */}
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={isRunning}
                onClick={runCode}
            >
                {isRunning ? "Ejecutando..." : "Compilar y Ejecutar"}
            </button>

            {/* Terminal de salida */}
            <pre className="bg-black text-green-400 font-mono p-3 rounded h-48 overflow-y-auto border border-gray-700">
                {output}
            </pre>
        </div>
    );
}
