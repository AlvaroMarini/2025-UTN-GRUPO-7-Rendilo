📘 Rendilo – Plataforma de Exámenes (Next.js)
🚀 Descripción

Rendilo es una webapp educativa para la gestión y rendición de exámenes.
Cuenta con dos dashboards principales:

👨‍🏫 Profesores: pueden crear, editar y administrar exámenes.

🎓 Alumnos: pueden rendir exámenes y visualizar sus notas.

Este proyecto está desarrollado en:

Next.js 15
 con App Router

TypeScript

Tailwind CSS v4
 para estilos

Zustand
 para manejo de estado global y persistencia en localStorage

📂 Estructura de carpetas
rendilo/
  app/                       # App Router de Next.js
    layout.tsx               # Layout raíz (header, tabs, footer)
    page.tsx                 # Página de inicio (redirige a /profes o muestra default)
    (dashboard)/             # Route group para dashboards
      alumnos/page.tsx       # Dashboard de alumnos
      profes/page.tsx        # Dashboard de profesores
      examen/
        [id]/
          editar/page.tsx    # Página de edición de examen
          rendir/page.tsx    # Página para rendir examen
  components/
    NavTabs.tsx              # Navegación superior con pestañas
    ui/
      Pill.tsx               # Componente UI reutilizable
      Card.tsx               # Componente UI reutilizable
      index.ts               # Reexporta componentes de UI
  store/
    exams.ts                 # Store Zustand con lógica de exámenes
  public/                    # Archivos estáticos
  .next/                     # Carpeta generada por Next (ignorada en git)
  node_modules/              # Dependencias (ignorada en git)
  package.json               # Dependencias y scripts
  tsconfig.json              # Configuración TypeScript
  tailwind.config.js         # Configuración Tailwind
  postcss.config.mjs         # Configuración PostCSS

⚙️ Instalación y uso
1. Clonar el repo
git clone <url-del-repo>
cd rendilo

2. Instalar dependencias
npm install


Dependencias clave:

next, react, react-dom

tailwindcss, @tailwindcss/postcss, autoprefixer

zustand

3. Ejecutar en desarrollo
npm run dev


Abrir en: http://localhost:3000