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
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-sand to-rose/40 text-5xl">
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
