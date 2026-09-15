import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unauthorized } from "@/lib/http/responses";
import { NextResponse } from "next/server";

// Primitiva irmã de requireRole.ts (ADR-020) — mas para sessão de CLIENTE, não
// de admin. Não existia nenhum guard server-side para isso antes desta sprint
// (só existia para admin). Diferente de requireRole/requireAdmin (retornam
// NextResponse | null), esta função também precisa devolver o telefone da
// sessão ao chamador — nunca aceitar telefone vindo do corpo da requisição.
export async function requireCustomer(): Promise<{ phone: string } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== "customer" || !session.user.phone) {
    return unauthorized();
  }
  return { phone: session.user.phone };
}
