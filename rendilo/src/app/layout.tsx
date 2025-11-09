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
      <body className="flex flex-col  min-h-screen bg-zinc-50 text-light antialiased">
        <AlertProvider>
          <header className="sticky top-0 z-10 border-b bg-primary backdrop-blur">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-gradient text-white font-bold">R</div>
                <div className="leading-tight">
                  <div className="text-xl text-white font-semibold">Rendilo</div>
                  <div className="text-xs text-white">Plataforma de exámenes</div>
                </div>
              </div>
              <NavTabs />
            </div>
          </header>

          <main className="w-full mx-auto max-w-4xl px-4 py-8">{children}</main>

          <footer className="mt-auto  text-center bg-primary w-full  py-5 text-xs text-white">
            © {new Date().getFullYear()} Rendilo
          </footer>
        </AlertProvider>
      </body>
    </html>
  );
}
