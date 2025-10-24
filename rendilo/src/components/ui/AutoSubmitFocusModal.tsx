"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AutoSubmitFocusModalProps {
  visible: boolean;
}

export default function AutoSubmitFocusModal({ visible }: AutoSubmitFocusModalProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true); 
      const timer = setTimeout(async () => {
        try {
          await document.exitFullscreen().catch(() => {});
        } finally {
          router.push("/alumnos"); 
        }
      }, 10000); 

      return () => clearTimeout(timer);
    }
  }, [visible, router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        className="
          relative w-[90%] max-w-md p-8 text-center
          rounded-2xl
          bg-[rgba(20,20,20,0.85)]
          backdrop-blur-xl
          border border-red-500/40
          shadow-[0_10px_40px_rgba(0,0,0,0.6)]
          animate-fade-in
        "
      >
        <h2 className="text-2xl font-semibold mb-3 text-red-400">
          🚨 Cambio de foco detectado
        </h2>

        <p className="text-gray-300/90 text-sm leading-relaxed mb-4">
          Detectamos que cambiaste de ventana o saliste del examen.
          <br />
          Por seguridad, tu examen se envió automáticamente.
        </p>

        <p className="text-sm text-gray-400 mt-2">
          Serás redirigido en{" "}
          <span className="font-semibold text-yellow-400">5 segundos...</span>
        </p>
      </div>
    </div>
  );
}
