"use client";
import { useEffect, useRef, useState } from "react";

export type CameraConstraints = {
  deviceId?: string;
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
};

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCamera(opts: CameraConstraints = {}) {
    setError(null);
    try {
      const { deviceId, width = 640, height = 480, facingMode = "user" } = opts;
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { width: { ideal: width }, height: { ideal: height }, facingMode },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamOn(true);
    } catch (e: any) {
      console.error("useCamera start error:", e?.name, e?.message);
      setError(e?.name ?? "UnknownError");
      setCamOn(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }

  // Limpieza al desmontar
  useEffect(() => stopCamera, []);

  return { videoRef, camOn, error, startCamera, stopCamera };
}
