"use client";

import Link from "next/link";
import { ChevronRight, ClipboardList, Clock, House, Mail, MapPin, Minus, Phone, Plus, ShoppingCart, Store, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/mock-data";
import { ProductImage } from "@/components/vitrine/ProductCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/types";

// Componentes EXCLUSIVOS da tela de pré-visualização (`/vitrine-preview`).
// Nada aqui é importado pela Vitrine real.

export interface PreviewStoreInfo {
  name: string;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  address: string | null;
}

/** Capa. `coverUrl` ainda não existe no StoreConfig — quando não há imagem,
 * usa um degradê da paleta (o chamador pode passar a foto de um produto só
 * para pré-visualizar o efeito). */
export function PreviewCover({ imageUrl }: { imageUrl?: string }) {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-wine to-wine-deep">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
        Pré-visualização
      </span>
    </div>
  );
}

export function PreviewStoreCard({
  store,
  slogan,
  openUntil,
  leadTimeLabel,
  onOpenInfo,
}: {
  store: PreviewStoreInfo;
  slogan: string;
  openUntil: string;
  leadTimeLabel: string | null;
  onOpenInfo: () => void;
}) {
  return (
    <section className="-mt-5 rounded-t-3xl bg-cream px-5 pt-5">
      <div className="flex items-center gap-2 rounded-2xl bg-sage/15 px-4 py-3 text-sm font-semibold text-sage">
        <Store className="size-4 shrink-0" />
        <span>Loja aberta até as {openUntil}</span>
      </div>

      <button
        type="button"
        onClick={onOpenInfo}
        className="mt-5 flex w-full items-center justify-between gap-3 text-left"
        aria-label="Ver informações da loja"
      >
        <div className="flex min-w-0 items-center gap-3">
          {store.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={store.logoUrl} alt="" className="size-12 shrink-0 rounded-full border border-sand object-cover" />
          )}
          <h1 className="font-display text-2xl font-extrabold leading-tight text-chocolate">{store.name}</h1>
        </div>
        <ChevronRight className="size-6 shrink-0 text-muted" />
      </button>

      <p className="mt-1 text-base text-muted">{slogan}</p>
      {leadTimeLabel && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-chocolate">
          <Clock className="size-4 text-wine" />
          {leadTimeLabel}
        </p>
      )}
    </section>
  );
}

export function PreviewStoreInfoDialog({
  store,
  openUntil,
  open,
  onClose,
}: {
  store: PreviewStoreInfo;
  openUntil: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{store.name}</DialogTitle>
          <DialogDescription>Informações da loja</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm text-chocolate">
          {store.address && (
            <li className="flex gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-wine" />{store.address}</li>
          )}
          {store.phone && (
            <li className="flex gap-3"><Phone className="mt-0.5 size-4 shrink-0 text-wine" />{store.phone}</li>
          )}
          {store.email && (
            <li className="flex gap-3"><Mail className="mt-0.5 size-4 shrink-0 text-wine" />{store.email}</li>
          )}
          {store.instagram && (
            <li className="flex gap-3"><span className="w-4 shrink-0 text-center text-wine">@</span>{store.instagram.replace(/^@/, "")}</li>
          )}
          <li className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-wine" />
            {/* Horário de exemplo — o StoreConfig ainda não tem horário de funcionamento. */}
            <span>Atendimento até as {openUntil} <span className="text-muted">(exemplo)</span></span>
          </li>
        </ul>
        {!store.address && !store.phone && !store.email && !store.instagram && (
          <p className="text-sm text-muted">Nenhum dado de contato cadastrado em Configuração.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Linha de produto: texto à esquerda, foto quadrada à direita com o controle
 * de quantidade sobreposto no canto — layout da referência. */
export function PreviewProductRow({
  product,
  quantity,
  onOpenDetails,
}: {
  product: Product;
  quantity: number;
  onOpenDetails: (product: Product) => void;
}) {
  const { addItem, updateQuantity } = useCart();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(product);
        }
      }}
      className="flex cursor-pointer gap-4 border-b border-sand py-4 last:border-b-0"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-base font-semibold leading-snug text-chocolate">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {product.description ?? `${product.leadTimeDays} ${product.leadTimeDays === 1 ? "dia" : "dias"} de prazo`}
        </p>
        <p className="mt-auto pt-3 text-base font-semibold text-chocolate">
          {formatCurrency(product.basePrice)}
          {product.basePrice < 10 ? <span className="text-sm font-normal text-muted"> /un</span> : null}
        </p>
      </div>

      <div className="relative shrink-0 pb-3 pr-1">
        <div className="flex size-[104px] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 text-4xl">
          <ProductImage product={product} />
        </div>
        <div className="absolute bottom-0 right-2" onClick={(e) => e.stopPropagation()}>
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="flex size-9 items-center justify-center rounded-full bg-wine text-white shadow-md transition-colors hover:bg-wine-deep"
              aria-label={`Adicionar ${product.name}`}
            >
              <Plus className="size-5" />
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-wine px-1 py-1 text-white shadow-md">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="flex size-7 items-center justify-center rounded-full hover:bg-white/15"
                aria-label="Diminuir quantidade"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-5 text-center text-sm font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="flex size-7 items-center justify-center rounded-full hover:bg-white/15"
                aria-label="Aumentar quantidade"
              >
                <Plus className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Barra inferior fixa (Início / Pedidos / Perfil) + barra de carrinho acima
 * dela quando há itens. "Cupons" da referência ficou de fora (sem módulo de
 * cupons). */
export function PreviewBottomBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { itemCount, subtotal } = useCart();

  const tabs = [
    { label: "Início", href: "/vitrine-preview", icon: House, active: true },
    { label: "Pedidos", href: "/pedidos", icon: ClipboardList, active: false },
    { label: "Perfil", href: "/login", icon: User, active: false },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-app">
      {itemCount > 0 && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={onOpenCart}
            className="flex w-full items-center justify-between rounded-full bg-wine px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-wine-deep"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="size-4" />
              Ver carrinho · {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
            <span>{formatCurrency(subtotal)}</span>
          </button>
        </div>
      )}
      <nav className="flex items-center justify-around border-t border-sand bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {tabs.map(({ label, href, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-20 flex-col items-center gap-0.5 rounded-2xl px-4 py-2 text-xs font-semibold transition-colors ${
              active ? "bg-wine/10 text-wine" : "text-muted hover:text-chocolate"
            }`}
          >
            <Icon className="size-6" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
