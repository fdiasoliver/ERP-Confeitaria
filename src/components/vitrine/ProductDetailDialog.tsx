"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/mock-data";
import { ProductImage } from "@/components/vitrine/ProductCard";
import type { Product } from "@/lib/types";

interface ProductDetailDialogProps {
  product: Product | null;
  quantity: number;
  onClose: () => void;
}

/** Pop-up de detalhes do produto — abre ao clicar em um card/linha da Vitrine
 * (ProductCard/ProductHero/ProductRow, Sprint DS.6). `product: null` mantém o
 * Dialog montado (fecha suavemente) em vez de desmontar/remontar a cada troca. */
export function ProductDetailDialog({ product, quantity, onClose }: ProductDetailDialogProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <Dialog open={product !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        {product && (
          <>
            <div className="-mx-4 -mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-t-xl bg-surface-2 text-7xl">
              <ProductImage product={product} />
            </div>

            <DialogHeader>
              <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
              {product.description && (
                <DialogDescription>{product.description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="flex items-center justify-between text-xs text-muted">
              <span>{product.categoryName}</span>
              <span>
                {product.leadTimeDays} {product.leadTimeDays === 1 ? "dia" : "dias"} de prazo
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-sand pt-4">
              <span className="text-lg font-semibold text-rose">
                {formatCurrency(product.basePrice)}
                {product.basePrice < 10 ? "/un" : ""}
              </span>
              {quantity === 0 ? (
                <Button type="button" onClick={() => addItem(product)}>
                  Adicionar
                </Button>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-sand p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="bg-card"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-[24px] text-center text-sm font-semibold">{quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="bg-card"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus />
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
