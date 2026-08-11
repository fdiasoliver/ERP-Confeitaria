"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/mock-data";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-chocolate/40"
        onClick={onClose}
        aria-hidden
      />
      {/* Mobile: bottom sheet. Desktop (md:+): painel ancorado à direita, altura cheia (Sprint DS.4) */}
      <div className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-app -translate-x-1/2 flex-col rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-2xl md:inset-y-0 md:left-auto md:right-0 md:bottom-auto md:h-full md:w-96 md:max-w-none md:translate-x-0 md:rounded-none md:rounded-l-3xl md:pb-6">
        <div className="mx-auto mb-5 h-1 w-10 shrink-0 rounded-full bg-sand md:hidden" />
        <h2 className="font-display mb-4 shrink-0 text-lg font-semibold">Seu carrinho</h2>

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
                  <p className="font-semibold text-sm">{item.product.name}</p>
                  <p className="text-muted text-xs">
                    {formatCurrency(item.product.basePrice)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-sand p-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    aria-label={item.quantity === 1 ? "Remover item" : "Diminuir quantidade"}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold"
                  >
                    {item.quantity === 1 ? "🗑" : "−"}
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-muted text-xs hover:text-rose"
                  aria-label="Remover"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="mt-4 flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-4 block w-full rounded-xl bg-chocolate py-4 text-center font-semibold text-white"
            >
              Finalizar pedido
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-xl border-2 border-sand py-3 font-semibold text-chocolate"
            >
              Continuar comprando
            </button>
          </>
        )}
      </div>
    </>
  );
}

export function CartFab({ onClick }: { onClick: () => void }) {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-chocolate px-5 py-3.5 font-semibold text-white shadow-lg md:left-auto md:right-6 md:translate-x-0"
    >
      🛒 {itemCount} {itemCount === 1 ? "item" : "itens"} · {formatCurrency(subtotal)}
    </button>
  );
}

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-chocolate px-4 py-2 text-sm text-white shadow-lg">
      {toast}
    </div>
  );
}
