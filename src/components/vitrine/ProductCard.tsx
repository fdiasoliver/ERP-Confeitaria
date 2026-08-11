"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  quantity: number;
}

export function ProductCard({ product, quantity }: ProductCardProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article className="overflow-hidden rounded-2xl border border-sand bg-white">
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
          <button
            type="button"
            onClick={() => updateQuantity(product.id, quantity - 1)}
            disabled={quantity === 0}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-[24px] text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              quantity === 0
                ? addItem(product)
                : updateQuantity(product.id, quantity + 1)
            }
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-bold"
          >
            +
          </button>
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
    <article className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4">
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
            <button
              type="button"
              onClick={() => addItem(product)}
              className="rounded-full bg-chocolate px-4 py-1.5 text-xs font-semibold text-white"
            >
              Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-white p-1">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-sand font-bold"
              >
                −
              </button>
              <span className="min-w-[20px] text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-sand font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
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
              : "border-sand bg-white text-chocolate"
          }`}
        >
          {occ.name}
        </button>
      ))}
    </div>
  );
}
