"use client";
import { create } from "zustand";

type CameraState = {
  allowCamera: boolean;            // usuario aceptó aviso
  preferredDeviceId?: string;      // selección del usuario
  setAllow: (v: boolean) => void;
  setDevice: (id?: string) => void;
};

export const useCameraStore = create<CameraState>((set) => ({
  allowCamera: false,
  preferredDeviceId: undefined,
  setAllow: (v) => set({ allowCamera: v }),
  setDevice: (id) => set({ preferredDeviceId: id }),
}));
