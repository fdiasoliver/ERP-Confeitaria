import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Mapa de proteção por papel — adicionar rotas à medida que os módulos forem implementados.
// Rotas não listadas aqui requerem apenas autenticação admin (qualquer UserRole).
const ROLE_REQUIRED: Record<string, string[]> = {
  "/admin/config": ["ADMIN"],
  // "/admin/usuarios": ["ADMIN"],
  // "/admin/financeiro": ["ADMIN", "FINANCEIRO"],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  if (!isAdminRoute) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Bloqueia: não autenticado OU autenticado como cliente (não como admin da equipe)
  if (!token || token.userType !== "admin") {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verifica papel específico quando a rota exige
  const requiredRoles = ROLE_REQUIRED[pathname];
  if (requiredRoles && token.role && !requiredRoles.includes(token.role as string)) {
    return NextResponse.redirect(new URL("/admin/em-construcao", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
