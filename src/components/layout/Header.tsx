"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface HeaderBrand {
  name: string;
  logoUrl: string | null;
}

/** Busca só o que o Header precisa (nome/logo) — GET /api/config retorna o
 * StoreConfig direto, sem envelope {success,data} (confirmado em
 * src/app/api/config/route.ts), mesmo padrão já usado em
 * src/app/(client)/orcamento/[token]/page.tsx. Falha silenciosa: mantém o
 * wordmark de texto padrão sem logo. */
function useHeaderBrand(): HeaderBrand {
  const [brand, setBrand] = useState<HeaderBrand>({ name: "Doce Menina", logoUrl: null });

  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setBrand({ name: data.name, logoUrl: data.logoUrl ?? null });
      })
      .catch(() => {});
  }, []);

  return brand;
}

// Redesign do Módulo Vitrine (20/09/2026) — palette wine/gold + Fraunces
// (font-serif) só neste export; HeaderMinimal (usado em checkout/pedidos/
// login/cadastro) não foi alterado.
export function Header() {
  const { itemCount } = useCart();
  const { name, logoUrl } = useHeaderBrand();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-card/95 px-5 py-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2.5">
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        )}
        <span className="font-serif text-xl font-semibold italic text-wine-deep">{name}</span>
      </Link>
      <nav className="hidden items-center gap-7 text-xs font-semibold uppercase tracking-wide text-muted md:flex">
        <a href="#inicio" className="transition-colors hover:text-wine">Início</a>
        <a href="#cardapio" className="transition-colors hover:text-wine">Cardápio</a>
        <a href="#quem-somos" className="transition-colors hover:text-wine">Quem Somos</a>
        <a href="#contato" className="transition-colors hover:text-wine">Fale Conosco</a>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/pedidos"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-card text-lg text-wine-deep transition-colors hover:bg-surface-2"
          aria-label="Meus pedidos"
        >
          📋
        </Link>
        <Link
          href="/login"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-card text-lg text-wine-deep transition-colors hover:bg-surface-2"
          aria-label="Perfil"
        >
          👤
        </Link>
        <CartButton count={itemCount} />
      </div>
    </header>
  );
}

function CartButton({ count }: { count: number }) {
  return (
    <Link
      href="/?cart=open"
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-wine text-lg text-white transition-colors hover:bg-wine-deep"
      aria-label={`Carrinho com ${count} itens`}
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function HeaderMinimal({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-sand bg-card px-5 py-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted text-sm hover:text-chocolate">
          ←
        </Link>
        <h1 className="font-display text-lg font-semibold text-chocolate">{title}</h1>
      </div>
    </header>
  );
}
