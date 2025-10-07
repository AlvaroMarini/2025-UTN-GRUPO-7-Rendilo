import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  (req) => {
    const { pathname, origin } = req.nextUrl;
    const token = req.nextauth.token as any;

    if (pathname === "/") {
      if (!token) return NextResponse.redirect(new URL("/login", origin));
      const dest = token.role === "teacher" ? "/profesores" : "/alumnos";
      return NextResponse.redirect(new URL(dest, origin));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/alumnos")) return (token as any)?.role === "student";
        if (path.startsWith("/profesores")) return (token as any)?.role === "teacher";
        return true; // resto público
      },
    },
  }
);

// Asegurate de incluir "/" en el matcher:
export const config = { matcher: ["/", "/alumnos/:path*", "/profesores/:path*"] };
