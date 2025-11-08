"use client";
import React, { useEffect } from "react";

interface ErrorAlertProps {
  visible: boolean;
  message?: string;
  onClose?: () => void;
  autoHideMs?: number;
}

export default function ErrorAlert({
  visible,
  message = "Ocurrió un error",
  onClose,
  autoHideMs,
}: ErrorAlertProps) {
  useEffect(() => {
    if (!visible || !autoHideMs) return;
    const t = setTimeout(() => onClose && onClose(), autoHideMs);
    return () => clearTimeout(t);
  }, [visible, autoHideMs, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-6 text-center
          rounded-2xl
          bg-[rgba(20,10,10,0.85)]
          backdrop-blur-xl
          border border-red-500/30
          shadow-[0_10px_30px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
        role="alert"
        aria-live="assertive"
      >
        <div className="absolute inset-0 pointer-events-none ring-1 ring-white/5 rounded-2xl" />

        <h3 className="text-xl font-semibold mb-2 text-red-400">Error</h3>
        <p className="text-gray-200/90 text-sm leading-relaxed mb-4">{message}</p>

        <div className="flex justify-center">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 rounded-md bg-red-500/10 text-red-200 border border-red-500/30 hover:bg-red-500/20"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
