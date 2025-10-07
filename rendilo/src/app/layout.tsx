import "./globals.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "Rendilo",
  description: "Plataforma de exámenes",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role;

  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-bold">R</div>
              <div className="leading-tight">
                <div className="text-xl font-semibold">Rendilo</div>
                <div className="text-xs text-zinc-500">Plataforma de exámenes</div>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              {!session ? (
                <Link href="/login" className="text-sm underline">Ingresar</Link>
              ) : (
                <>
                  <Link
                    href={role === "teacher" ? "/profesores" : "/alumnos"}
                    className="text-sm underline"
                  >
                    Dashboard
                  </Link>
                  <SignOutButton />
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

        <footer className="mx-auto max-w-4xl px-4 py-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Rendilo
        </footer>
      </body>
    </html>
  );
}
