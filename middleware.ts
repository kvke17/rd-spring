import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Esta función se ejecuta si el usuario ya pasó la primera barrera (estar logueado)
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Si intenta entrar a /admin y su rol no es ADMIN, lo devolvemos a la página principal (o a un 403 No Autorizado)
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      // La primera barrera: ¿Tiene un token válido?
      authorized: ({ token }) => !!token, 
    },
  }
);

// Aquí le decimos al "guardia" en qué puertas debe pararse
export const config = {
  matcher: [
    "/admin/:path*", // Protege absolutamente todo lo que esté dentro de /admin
  ],
};