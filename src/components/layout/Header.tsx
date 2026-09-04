"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sand bg-card px-5 py-4">
      <Link href="/" className="font-display text-xl font-semibold text-chocolate">
        Doce Menina
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/pedidos"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-lg"
          aria-label="Meus pedidos"
        >
          📋
        </Link>
        <Link
          href="/login"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-lg"
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
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-chocolate text-lg text-white"
      aria-label={`Carrinho com ${count} itens`}
    >
      🛒
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-rose text-[10px] font-bold text-white">
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
