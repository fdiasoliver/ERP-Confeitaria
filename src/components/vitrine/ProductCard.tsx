"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  quantity: number;
}

export function ProductCard({ product, quantity }: ProductCardProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article className="overflow-hidden rounded-2xl border border-sand bg-card">
      <div className="flex aspect-square items-center justify-center bg-surface-2 text-5xl">
        {product.imageEmoji}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight">{product.name}</h3>
        <p className="text-muted mt-1 text-xs">
          {formatCurrency(product.basePrice)}
          {product.basePrice < 10 ? "/un" : ""}
          {" · "}
          {product.leadTimeDays} {product.leadTimeDays === 1 ? "dia" : "dias"}
        </p>
        <div className="mt-2 flex items-center justify-between rounded-lg bg-sand p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="bg-card"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            disabled={quantity === 0}
            aria-label="Diminuir quantidade"
          >
            <Minus />
          </Button>
          <span className="min-w-[24px] text-center text-sm font-semibold">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="bg-card"
            onClick={() =>
              quantity === 0
                ? addItem(product)
                : updateQuantity(product.id, quantity + 1)
            }
            aria-label="Aumentar quantidade"
          >
            <Plus />
          </Button>
        </div>
      </div>
    </article>
  );
}

interface ProductHeroProps {
  product: Product;
  quantity: number;
}

export function ProductHero({ product, quantity }: ProductHeroProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article className="flex items-center gap-4 rounded-2xl border border-sand bg-card p-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-4xl">
        {product.imageEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-muted mt-0.5 text-xs">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-rose">
            {formatCurrency(product.basePrice)}
            {product.basePrice < 10 ? "/un" : ""}
          </span>
          {quantity === 0 ? (
            <Button type="button" size="sm" className="rounded-full" onClick={() => addItem(product)}>
              Adicionar
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-card p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="bg-sand"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Diminuir quantidade"
              >
                <Minus />
              </Button>
              <span className="min-w-[20px] text-center text-sm font-semibold">{quantity}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="bg-sand"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                aria-label="Aumentar quantidade"
              >
                <Plus />
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Célula "Produto" da visão "Lista" da Vitrine (ViewToggle, Sprint DS.6)
 * dentro de EntityTable — alternativa ao grid de ProductCard. O controle de
 * quantidade fica em ProductRowActions, a célula de "Ações" da mesma linha. */
export function ProductRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xl">
        {product.imageEmoji}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-chocolate">{product.name}</p>
        <p className="text-xs text-muted">
          {product.leadTimeDays} {product.leadTimeDays === 1 ? "dia" : "dias"}
        </p>
      </div>
    </div>
  );
}

export function ProductRowActions({ product, quantity }: ProductCardProps) {
  const { addItem, updateQuantity } = useCart();

  if (quantity === 0) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => addItem(product)}>
        Adicionar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-sand p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="bg-card"
        onClick={() => updateQuantity(product.id, quantity - 1)}
        aria-label="Diminuir quantidade"
      >
        <Minus />
      </Button>
      <span className="min-w-[20px] text-center text-sm font-semibold">{quantity}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="bg-card"
        onClick={() => updateQuantity(product.id, quantity + 1)}
        aria-label="Aumentar quantidade"
      >
        <Plus />
      </Button>
    </div>
  );
}

interface CategoryChipsProps {
  occasions: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryChips({
  occasions,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-none">
      {occasions.map((occ) => (
        <button
          key={occ.id}
          type="button"
          onClick={() => onSelect(occ.id)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            selected === occ.id
              ? "border-chocolate bg-chocolate text-white"
              : "border-sand bg-card text-chocolate"
          }`}
        >
          {occ.name}
        </button>
      ))}
    </div>
  );
}
