"use client";
import React from "react";

interface ExitExamModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ExitExamModal({
  visible,
  onConfirm,
  onCancel,
}: ExitExamModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-8 text-center
          rounded-2xl
          bg-[rgba(20,20,20,0.75)]
          backdrop-blur-xl
          border border-red-500/40
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
      >
        <h2 className="text-2xl font-semibold mb-3 text-red-400">
          ⚠️ Salir del examen
        </h2>
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          Si salís de la pantalla completa o cambiás de ventana,
          el examen se enviará automáticamente. <br />
          ¿Querés salir del examen?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="
              px-5 py-2 rounded-lg
              bg-gray-700 hover:bg-gray-600
              text-gray-200 font-medium
              transition-all duration-150
            "
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="
              px-5 py-2 rounded-lg
              bg-red-600 hover:bg-red-700
              text-white font-medium
              transition-all duration-150
            "
          >
            Salir y enviar
          </button>
        </div>
      </div>
    </div>
  );
}
