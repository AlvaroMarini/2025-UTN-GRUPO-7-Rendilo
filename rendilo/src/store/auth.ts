"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "profesor" | "alumno";

type AuthState = {
  role: Role | null;
  loginAs: (role: Role) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      loginAs: (role) => set({ role }),
      logout: () => set({ role: null }),
    }),
    { name: "rendilo-auth" }
  )
);
