"use client";

import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function mapNextAuthError(code?: string): string {
  // Errores típicos de NextAuth
  switch (code) {
    case "CredentialsSignin":
      return "Credenciales inválidas. Verificá tu correo y contraseña.";
    case "AccessDenied":
      return "Acceso denegado.";
    case "Configuration":
      return "Error de configuración del login. Contactá al admin.";
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Hubo un problema con el proveedor de autenticación.";
    default:
      return "No pudimos iniciar sesión. Probá de nuevo.";
  }
}

export default function Login() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{ email?: string; pass?: string }>({});

  // Si entraste por redirección con ?error=...
  const incomingError = useMemo(() => search.get("error") ?? undefined, [search]);
  useEffect(() => {
    if (incomingError) setErr(mapNextAuthError(incomingError));
  }, [incomingError]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setFieldErr({});

    // Validación mínima en cliente
    const errors: { email?: string; pass?: string } = {};
    if (!email) errors.email = "Ingresá tu correo.";
    if (!pass) errors.pass = "Ingresá tu contraseña.";
    if (Object.keys(errors).length) {
      setFieldErr(errors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await signIn("credentials", {
        email,
        password: pass,
        redirect: false, // manejamos nosotros la navegación
      });

      if (!res) {
        setErr("No pudimos conectar con el servidor de autenticación.");
        return;
      }

      if (res.error) {
        setErr(mapNextAuthError(res.error));
        return;
      }

      // Éxito: decidimos destino por rol
      const session = await getSession();
      const role = (session as any)?.role;
      router.replace(role === "teacher" ? "/profesores" : "/alumnos");
    } catch (e) {
      setErr("Ocurrió un error inesperado. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm py-10 px-4">
      <h1 className="text-xl font-semibold mb-4 text-white">Ingresar</h1>

      {/* Banner de error general */}
      {err && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-white font-medium">Correo</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 ${
              fieldErr.email
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-indigo-300"
            }`}
            placeholder="alumno@demo.com"
            autoComplete="email"
          />
          {fieldErr.email && (
            <span className="mt-1 block text-xs text-red-500">{fieldErr.email}</span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-white font-medium">Contraseña</span>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 ${
              fieldErr.pass
                ? "border-red-400 focus:ring-red-300"
                : "border-gray-300 focus:ring-indigo-300"
            }`}
            placeholder="•••"
            autoComplete="current-password"
          />
          {fieldErr.pass && (
            <span className="mt-1 block text-xs text-red-500">{fieldErr.pass}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? "Ingresando…" : "Ingresar"}
        </button>

        <p className="text-xs text-zinc-400">
          Demo: <b>alumno@demo.com / 123</b> • <b>profe@demo.com / 123</b>
        </p>
      </form>
    </main>
  );
}
