"use client";
import React from "react";

interface MultiFaceModalProps {
  visible: boolean;
}

export default function MultiFaceModal({ visible }: MultiFaceModalProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-8 text-center
          rounded-2xl
          bg-[rgba(20,20,20,0.7)]
          backdrop-blur-xl
          border border-yellow-500/40
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
      >
        <h2 className="text-2xl font-semibold mb-3 text-yellow-400">
          ⚠️ Múltiples rostros detectados
        </h2>
        <p className="text-gray-300/90 text-sm leading-relaxed mb-4">
          Se ha detectado más de una persona frente a la cámara.
          <br />
          El examen será enviado automáticamente.
        </p>
      </div>
    </div>
  );
}
