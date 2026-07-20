"use client";

import { useSession } from "next-auth/react";
import type { Customer } from "@/lib/types";

// Retorna o cliente autenticado a partir da sessão NextAuth.
// Retorna null quando não há sessão de cliente (não logado, ou logado como admin).
// TODO (Fase 8): quando OTP via WhatsApp for implementado, o login do cliente
// passará por validação de código antes de criar a sessão — sem mudanças necessárias aqui.
export function useCurrentUser(): Customer | null {
  const { data: session } = useSession();

  if (!session?.user || session.user.userType !== "customer") return null;

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    phone: session.user.phone ?? "",
    addresses: [],
  };
}
