"use client";
import React from "react";

interface ModalInterrupcion {
    visible: boolean;
    onAccept: () => void;
}

export default function ModalInterrupcion({
    visible,
    onAccept
}: ModalInterrupcion) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div
                className="
          relative w-[90%] max-w-md p-8 text-center
          rounded-2xl
          bg-[rgba(20,20,20,0.6)]
          backdrop-blur-xl
          border border-white/15
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
            >
                { }
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                <div className="pointer-events-none absolute -top-1 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-full bg-white/5 blur-xl" />

                <h2 className="text-2xl font-semibold mb-3 text-red-400">
                    Examen Interrumpido
                </h2>
                <p className="text-gray-300/90 text-sm leading-relaxed">
                    Hubo un cambio de foco en el examen, pero se cuando con exito!!
                    Presione Aceptar para salir.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <button
                        onClick={onAccept}
                        className="
                            px-6 py-2 rounded-full
                            bg-white/10 hover:bg-white/15 active:bg-white/20
                            text-white font-medium
                            border border-white/15
                            shadow-[0_4px_18px_rgba(0,0,0,0.4)]
                            transition-colors
                            "
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}