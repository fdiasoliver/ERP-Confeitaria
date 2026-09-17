"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CartDrawer, CartFab } from "@/components/layout/CartDrawer";

// Shell da área cliente (Sprint DS.4) — mesmo papel de AdminShell (Sprint DS.2)
// para o admin. Carrinho (CartFab/CartDrawer) disponível em TODAS as páginas
// cliente, incluindo /login — decisão explícita do Product Owner (DS.4,
// override da recomendação original de excluir /login). Notificações (toast)
// migradas para o <Toaster /> global do sonner em src/app/layout.tsx (DS.5.5).
function CartOpenSync({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("cart") === "open") onOpen();
  }, [searchParams, onOpen]);

  return null;
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const pathname = usePathname();
  // Checkout já mostra o carrinho inline (itens + resumo) — o FAB fica
  // redundante ali e, em mobile, sobrepõe o botão final de confirmação.
  // /orcamento/[token] é acessado por link direto (WhatsApp), sem sessão de
  // compra em andamento — carrinho não faz sentido nesse fluxo.
  const showFab = pathname !== "/checkout" && !pathname.startsWith("/orcamento/");

  return (
    <>
      <Suspense fallback={null}>
        <CartOpenSync onOpen={openCart} />
      </Suspense>
      {children}
      {showFab && <CartFab onClick={openCart} />}
      <CartDrawer open={cartOpen} onClose={closeCart} />
    </>
  );
}
