"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const handleLogin = (role: "profesor" | "alumno") => {
    loginAs(role);
    router.replace(role === "profesor" ? "/profesores" : "/alumnos");
  };

  return (
    <section className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Ingresar</h1>
      <p className="text-sm text-primary">
        Accesos de demostración (sin base de datos):
      </p>
      <div className="grid gap-3">
        <button
          className="btn-primary p-4 "
          onClick={() => handleLogin("profesor")}
        >
          Entrar como Profesor (demo)
        </button>
        <button
          className="btn-primary p-4"
          onClick={() => handleLogin("alumno")}
        >
          Entrar como Alumno (demo)
        </button>
      </div>
    </section>
  );
}
