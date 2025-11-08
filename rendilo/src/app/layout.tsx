import "./globals.css";
import type { Metadata } from "next";
import NavTabs from "@/components/navTabs";
import { AlertProvider } from "@/components/alerts/AlertProvider";

export const metadata: Metadata = {
  title: "Rendilo",
  description: "Plataforma de exámenes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <AlertProvider>
          <header className="sticky top-0 z-10 border-b bg-slate-500/70 backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-bold">R</div>
                <div className="leading-tight">
                  <div className="text-xl font-semibold">Rendilo</div>
                  <div className="text-xs text-zinc-300">Plataforma de exámenes</div>
                </div>
              </div>
              <NavTabs />
            </div>
          </header>

          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

          <footer className="mx-auto max-w-4xl px-4 py-10 text-xs text-zinc-500">
            © {new Date().getFullYear()} Rendilo
          </footer>
        </AlertProvider>
      </body>
    </html>
  );
}
