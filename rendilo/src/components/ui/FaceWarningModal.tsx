"use client";
import React from "react";

interface FaceWarningModalProps {
  visible: boolean;
  countdown: number;
}

export default function FaceWarningModal({ visible, countdown }: FaceWarningModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-8 text-center
          rounded-2xl
          bg-[rgba(20,20,20,0.7)]
          backdrop-blur-xl
          border border-red-500/30
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
      >
        <div className="absolute inset-0 pointer-events-none ring-1 ring-white/10 rounded-2xl" />

        <h2 className="text-2xl font-semibold mb-3 text-red-400">
          Rostro no detectado
        </h2>
        <p className="text-gray-300/90 text-sm leading-relaxed mb-4">
          Vuelve frente a la cámara o el examen se enviará automáticamente.
        </p>

        <p className="text-4xl font-bold text-yellow-400 drop-shadow-lg">
          {countdown}
        </p>
      </div>
    </div>
  );
}
