import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ProfesPage from "./pages/profesores.jsx";
import AlumnosPage from "./pages/alumnos.jsx";
import EditExam from "./pages/editExam.jsx";
import TakeExam from "./pages/takeExam.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ProfesPage /> },
      { path: "profes", element: <ProfesPage /> },
      { path: "alumnos", element: <AlumnosPage /> },
      { path: "examen/:id/editar", element: <EditExam /> },
      { path: "examen/:id/rendir", element: <TakeExam /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
