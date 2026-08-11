"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CartDrawer, CartFab, Toast } from "@/components/layout/CartDrawer";

// Shell da área cliente (Sprint DS.4) — mesmo papel de AdminShell (Sprint DS.2)
// para o admin. Carrinho (CartFab/CartDrawer/Toast) disponível em TODAS as
// páginas cliente, incluindo /login — decisão explícita do Product Owner
// (DS.4, override da recomendação original de excluir /login).
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
  const showFab = pathname !== "/checkout";

  return (
    <>
      <Suspense fallback={null}>
        <CartOpenSync onOpen={openCart} />
      </Suspense>
      {children}
      {showFab && <CartFab onClick={openCart} />}
      <CartDrawer open={cartOpen} onClose={closeCart} />
      <Toast />
    </>
  );
}
