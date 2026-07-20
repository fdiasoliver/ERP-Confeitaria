"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  CartDrawer,
  CartFab,
  Toast,
} from "@/components/layout/CartDrawer";
import { CategoryChips, ProductCard } from "@/components/vitrine/ProductCard";
import { useCart } from "@/context/CartContext";
import { OCCASIONS as OCCASIONS_FALLBACK, PRODUCTS as MOCK_PRODUCTS } from "@/lib/mock-data";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

interface Occasion {
  id: string;
  name: string;
  slug?: string;
}

const ALL_OCCASION: Occasion = { id: "all", name: "Todos" };

function VitrineContent() {
  const [occasion, setOccasion] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [occasions, setOccasions] = useState<Occasion[]>([ALL_OCCASION, ...OCCASIONS_FALLBACK]);
  const searchParams = useSearchParams();
  const { items } = useCart();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts(MOCK_PRODUCTS));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/occasions", { cache: "no-store" });
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error?.message);
        }
        const occasions: { id: string; name: string; slug: string }[] = result.data;
        setOccasions([ALL_OCCASION, ...occasions.map((t) => ({ id: t.slug, name: t.name }))]);
      } catch {
        // mantém fallback — OCCASIONS_FALLBACK já é o estado inicial
      }
    })();
  }, []);

  useEffect(() => {
    // Syncing URL param to state is a valid external-system sync — no cascade risk.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (searchParams.get("cart") === "open") setCartOpen(true);
  }, [searchParams]);

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => { map[i.productId] = i.quantity; });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    if (occasion === "all") return products;
    return products.filter((p) => p.occasions.includes(occasion));
  }, [occasion, products]);

  // KI-14: categorias derivadas dos produtos reais, sem array hardcoded
  const featured = filtered.filter((p) => p.featured);
  const byCategory = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    products.forEach((p) => {
      if (!seen.has(p.categoryName)) {
        seen.add(p.categoryName);
        order.push(p.categoryName);
      }
    });
    return order
      .map((name) => ({
        name,
        products: filtered.filter((p) => p.categoryName === name && !p.featured),
      }))
      .filter((c) => c.products.length > 0);
  }, [products, filtered]);

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-24">
      <Header />
      <CategoryChips
        occasions={occasions}
        selected={occasion}
        onSelect={setOccasion}
      />

      {featured.length > 0 && (
        <section className="px-5 pb-6">
          <h2 className="font-display mb-3 text-lg font-semibold">Destaques</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {byCategory.map((cat) => (
        <section key={cat.name} className="px-5 pb-6">
          <h2 className="font-display mb-3 text-lg font-semibold">{cat.name}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {cat.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] ?? 0}
              />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="px-5 py-12 text-center text-muted">
          Nenhum produto nesta categoria.
        </p>
      )}

      <CartFab onClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Toast />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <VitrineContent />
    </Suspense>
  );
}
