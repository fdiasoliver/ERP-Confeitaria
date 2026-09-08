"use client";

import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/mock-data";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onOpenDetails: (product: Product) => void;
}

/** Imagem real (Supabase/S3) tem prioridade sobre o emoji quando disponível
 * (regra já documentada em Product.imageUrl, lib/types.ts) — antes só o
 * emoji era renderizado, mesmo com imageUrl presente. */
export function ProductImage({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
    );
  }
  return <>{product.imageEmoji}</>;
}

function handleCardKeyDown(e: React.KeyboardEvent, onOpen: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onOpen();
  }
}

// Card inteiro abre o pop-up de detalhes ao clicar/Enter/Espaço; os botões de
// quantidade avisam o clique com stopPropagation para não abrir o pop-up junto.
export function ProductCard({ product, quantity, onOpenDetails }: ProductCardProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(product)}
      onKeyDown={(e) => handleCardKeyDown(e, () => onOpenDetails(product))}
      className="cursor-pointer overflow-hidden rounded-2xl border border-sand bg-card"
    >
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-surface-2 text-5xl">
        <ProductImage product={product} />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold leading-tight">{product.name}</h3>
        <p className="text-muted mt-1 text-xs">
          {formatCurrency(product.basePrice)}
          {product.basePrice < 10 ? "/un" : ""}
          {" · "}
          {product.leadTimeDays} {product.leadTimeDays === 1 ? "dia" : "dias"}
        </p>
        <div
          className="mt-2 flex items-center justify-between rounded-lg bg-sand p-1"
          onClick={(e) => e.stopPropagation()}
        >
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
  onOpenDetails: (product: Product) => void;
}

export function ProductHero({ product, quantity, onOpenDetails }: ProductHeroProps) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(product)}
      onKeyDown={(e) => handleCardKeyDown(e, () => onOpenDetails(product))}
      className="flex cursor-pointer items-center gap-4 rounded-2xl border border-sand bg-card p-4"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-4xl">
        <ProductImage product={product} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
        {product.description && (
          <p className="text-muted mt-0.5 text-xs">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
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
 * quantidade fica em ProductRowActions, a célula de "Ações" da mesma linha
 * (colunas diferentes de <table>, sem conflito de clique aninhado). */
export function ProductRow({ product, onOpenDetails }: { product: Product; onOpenDetails: (product: Product) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpenDetails(product)}
      className="flex w-full items-center gap-3 text-left"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-xl">
        <ProductImage product={product} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-chocolate">{product.name}</p>
        <p className="text-xs text-muted">
          {product.leadTimeDays} {product.leadTimeDays === 1 ? "dia" : "dias"}
        </p>
      </div>
    </button>
  );
}

export function ProductRowActions({ product, quantity }: Omit<ProductCardProps, "onOpenDetails">) {
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
