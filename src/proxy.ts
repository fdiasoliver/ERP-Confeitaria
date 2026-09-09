import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Mapa de proteção por papel — adicionar rotas à medida que os módulos forem implementados.
// Rotas não listadas aqui requerem apenas autenticação admin (qualquer UserRole).
const ROLE_REQUIRED: Record<string, string[]> = {
  "/admin/config": ["ADMIN"],
  "/admin/clientes": ["ADMIN", "ATENDIMENTO"],
  "/admin/producao": ["ADMIN", "ATENDIMENTO", "PRODUCAO", "FINANCEIRO"],
  "/admin/unidades": ["ADMIN", "PRODUCAO"],
  "/admin/ingredientes": ["ADMIN", "PRODUCAO"],
  "/admin/receitas": ["ADMIN", "PRODUCAO"],
  "/admin/fornecedores": ["ADMIN", "PRODUCAO"],
  "/admin/embalagens": ["ADMIN", "PRODUCAO"],
  "/admin/relatorios": ["ADMIN", "FINANCEIRO"],
  "/admin/despesas": ["ADMIN", "FINANCEIRO"],
  "/admin/usuarios": ["ADMIN"],
};

// Casa tanto a rota exata quanto suas sub-rotas (ex.: "/admin/clientes/[id]"
// deve respeitar a mesma exigência de papel de "/admin/clientes").
function findRequiredRoles(pathname: string): string[] | undefined {
  const key = Object.keys(ROLE_REQUIRED).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return key ? ROLE_REQUIRED[key] : undefined;
}

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
  const requiredRoles = findRequiredRoles(pathname);
  if (requiredRoles && token.role && !requiredRoles.includes(token.role as string)) {
    return NextResponse.redirect(new URL("/admin/em-construcao", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
