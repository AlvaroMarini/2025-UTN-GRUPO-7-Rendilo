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
  const [camOn, setCamOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceCount, setFaceCount] = useState<number>(0);

  const cameraRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🔹 Cargar los scripts de MediaPipe una sola vez
  async function loadScripts() {
    if (!(window as any).FaceDetection) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/face_detection.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar FaceDetection"));
        document.body.appendChild(script);
      });
    }

    if (!(window as any).Camera) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar CameraUtils"));
        document.body.appendChild(script);
      });
    }
  }

  // 🔹 Iniciar cámara y detección facial
  async function startCamera(opts: CameraConstraints = {}) {
    setError(null);
    try {
      await loadScripts();

      // resolución reducida por defecto
      const { deviceId, width = 480, height = 360, facingMode = "user" } = opts;

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

      const FaceDetection = (window as any).FaceDetection;
      const Camera = (window as any).Camera;

      const faceDetection = new FaceDetection({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`,
      });

      faceDetection.setOptions({
        model: "short",
        minDetectionConfidence: 0.6,
      });

      faceDetection.onResults((results: any) => {
        const count = results.detections?.length || 0;
        setFaceCount(count);
      });

      // 🔹 Detección cada 500ms (ahorra CPU)
      let lastRun = 0;
      const camera = new Camera(videoRef.current!, {
        onFrame: async () => {
          const now = Date.now();
          if (now - lastRun > 500) {
            await faceDetection.send({ image: videoRef.current! });
            lastRun = now;
          }
        },
        width,
        height,
      });

      cameraRef.current = camera;
      camera.start();
      setCamOn(true);
    } catch (e: any) {
      console.error("useCamera start error:", e);
      setError(e?.message || "Error desconocido");
      setCamOn(false);
    }
  }

  // 🔹 Detener cámara y liberar recursos
  function stopCamera() {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      cameraRef.current?.stop?.();
      setCamOn(false);
    } catch (e) {
      console.warn("Error deteniendo cámara:", e);
    }
  }

  // Limpieza automática al desmontar
  useEffect(() => stopCamera, []);

  return { videoRef, camOn, error, faceCount, startCamera, stopCamera };
}
