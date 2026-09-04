"use client";

import Link from "next/link";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X, Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Bottom sheet em mobile, painel ancorado à direita em desktop (md:+, Sprint DS.4).
 * Migrado para as primitivas Radix Dialog (mesmo motor do Sheet do shadcn/ui,
 * ADR-025) na Sprint DS.5.5 — ganha trap de foco e fechamento por Escape/overlay
 * de graça, que a implementação anterior não tinha.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <SheetPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-40 bg-chocolate/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <SheetPrimitive.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-card px-5 pb-8 pt-4 shadow-2xl outline-none data-open:animate-in data-open:slide-in-from-bottom-10 data-closed:animate-out data-closed:slide-out-to-bottom-10 md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-96 md:rounded-none md:rounded-l-3xl md:pb-6 md:data-open:slide-in-from-bottom-0 md:data-closed:slide-out-to-bottom-0"
        >
          <div className="mx-auto mb-5 h-1 w-10 shrink-0 rounded-full bg-sand md:hidden" />

          <div className="mb-4 flex shrink-0 items-center justify-between">
            <SheetPrimitive.Title className="font-display text-lg font-semibold text-chocolate">
              Seu carrinho
            </SheetPrimitive.Title>
            <SheetPrimitive.Close asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Fechar carrinho">
                <X />
              </Button>
            </SheetPrimitive.Close>
          </div>

          {items.length === 0 ? (
            <p className="py-8 text-center text-muted">Carrinho vazio</p>
          ) : (
            <div className="max-h-[50vh] space-y-3 overflow-y-auto md:max-h-none md:flex-1">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 border-b border-sand py-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.product.name}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(item.product.basePrice)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-sand p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="bg-card"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label={item.quantity === 1 ? "Remover item" : "Diminuir quantidade"}
                    >
                      {item.quantity === 1 ? <Trash2 /> : <Minus />}
                    </Button>
                    <span className="min-w-[24px] text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="bg-card"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remover"
                    className="text-muted hover:text-rose"
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="mt-4 flex shrink-0 justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <Button asChild className="mt-4 w-full py-6 text-base">
                <Link href="/checkout" onClick={onClose}>
                  Finalizar pedido
                </Link>
              </Button>
              <Button type="button" variant="outline" className="mt-2 w-full py-6 text-base" onClick={onClose}>
                Continuar comprando
              </Button>
            </>
          )}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}

export function CartFab({ onClick }: { onClick: () => void }) {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <Button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 left-1/2 z-20 h-auto -translate-x-1/2 gap-2 rounded-full px-5 py-3.5 text-base shadow-lg md:left-auto md:right-6 md:translate-x-0"
    >
      <ShoppingCart className="size-4" />
      {itemCount} {itemCount === 1 ? "item" : "itens"} · {formatCurrency(subtotal)}
    </Button>
  );
}
