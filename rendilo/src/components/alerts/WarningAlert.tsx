"use client";
import React, { useEffect } from "react";

interface WarningAlertProps {
  visible: boolean;
  message?: string;
  onClose?: () => void;
  autoHideMs?: number; // opcional, oculta automaticamente
}

export default function WarningAlert({
  visible,
  message = "Advertencia",
  onClose,
  autoHideMs,
}: WarningAlertProps) {
  useEffect(() => {
    if (!visible || !autoHideMs) return;
    const t = setTimeout(() => onClose && onClose(), autoHideMs);
    return () => clearTimeout(t);
  }, [visible, autoHideMs, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-6 text-center
          rounded-2xl
          bg-[rgba(30,30,20,0.85)]
          backdrop-blur-xl
          border border-yellow-400/25
          shadow-[0_10px_30px_rgba(0,0,0,0.5)]
          animate-fade-in
        "
        role="alert"
        aria-live="polite"
      >
        <div className="absolute inset-0 pointer-events-none ring-1 ring-white/5 rounded-2xl" />

        <h3 className="text-xl font-semibold mb-2 text-yellow-300">Advertencia</h3>
        <p className="text-gray-200/90 text-sm leading-relaxed mb-4">{message}</p>

        <div className="flex justify-center">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 rounded-md bg-yellow-400/10 text-yellow-200 border border-yellow-400/30 hover:bg-yellow-400/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
