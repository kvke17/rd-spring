import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const method = req.method;

    // 1. Protección de API Administrativa (/api/admin/*)
    if (path.startsWith("/api/admin")) {
      // Excepción: GET en /api/admin/products es consumido por el catálogo público de repuestos y aceites
      if (path === "/api/admin/products" && method === "GET") {
        return NextResponse.next();
      }

      if (!token) {
        return NextResponse.json(
          { error: "Autenticación requerida para acceder a la API administrativa." },
          { status: 401 }
        );
      }

      if (token.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Acceso denegado: se requieren privilegios de Administrador." },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }

    // 2. Protección de Vistas Administrativas (/admin/*)
    if (path.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login?callbackUrl=" + encodeURIComponent(path), req.url));
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // 3. Protección de Perfil de Usuario (/perfil/*)
    if (path.startsWith("/perfil")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login?callbackUrl=/perfil", req.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        const method = req.method;

        // Permitir el catálogo público GET /api/admin/products sin sesión previa
        if (path === "/api/admin/products" && method === "GET") {
          return true;
        }

        // Para todas las demás rutas protegidas por matcher, se requiere token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/perfil/:path*",
  ],
};