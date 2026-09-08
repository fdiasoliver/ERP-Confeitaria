"use client";

import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { CategoryChips, ProductCard, ProductHero, ProductRow, ProductRowActions } from "@/components/vitrine/ProductCard";
import { VitrineSidebar } from "@/components/vitrine/VitrineSidebar";
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { useCart } from "@/context/CartContext";
import { formatCurrency, OCCASIONS as OCCASIONS_FALLBACK, PRODUCTS as MOCK_PRODUCTS } from "@/lib/mock-data";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

interface Occasion {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

const ALL_OCCASION: Occasion = { id: "all", name: "Todos", icon: "layout-grid" };

export default function HomePage() {
  const [occasion, setOccasion] = useState("all");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [occasions, setOccasions] = useState<Occasion[]>([ALL_OCCASION, ...OCCASIONS_FALLBACK]);
  const [view, setView] = useViewMode("vitrine");
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
        const occasions: { id: string; name: string; slug: string; icon?: string }[] = result.data;
        setOccasions([
          ALL_OCCASION,
          ...occasions.map((t) => ({ id: t.slug, name: t.name, icon: t.icon })),
        ]);
      } catch {
        // mantém fallback — OCCASIONS_FALLBACK já é o estado inicial
      }
    })();
  }, []);

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
  const hero = featured[0];
  const featuredRest = featured.slice(1);
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

  const columns: EntityColumn<Product>[] = [
    {
      key: "product",
      header: "Produto",
      render: (p) => <ProductRow product={p} />,
    },
    {
      key: "price",
      header: "Preço",
      className: "text-right",
      render: (p) => (
        <span className="font-semibold text-chocolate">
          {formatCurrency(p.basePrice)}{p.basePrice < 10 ? "/un" : ""}
        </span>
      ),
    },
  ];

  function renderCollection(products: Product[]) {
    if (view === "list") {
      return (
        <EntityTable
          items={products}
          columns={columns}
          getKey={(p) => p.id}
          renderActions={(p) => <ProductRowActions product={p} quantity={quantities[p.id] ?? 0} />}
        />
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream md:flex">
      <VitrineSidebar occasions={occasions} selected={occasion} onSelect={setOccasion} />

      <div className="mx-auto w-full max-w-app pb-24 md:max-w-none md:flex-1 md:pb-8">
        <Header />
        <div className="md:hidden">
          <CategoryChips
            occasions={occasions}
            selected={occasion}
            onSelect={setOccasion}
          />
        </div>

        <div className="md:mx-auto md:max-w-7xl md:px-6 md:py-6">
          {filtered.length > 0 && (
            <div className="flex justify-end px-5 pb-2 md:px-0">
              <ViewToggle value={view} onChange={setView} />
            </div>
          )}

          {hero && (
            <section className="px-5 pb-6 md:px-0">
              <ProductHero product={hero} quantity={quantities[hero.id] ?? 0} />
            </section>
          )}

          {featuredRest.length > 0 && (
            <section className="px-5 pb-6 md:px-0">
              <h2 className="font-display mb-3 text-lg font-semibold">Destaques</h2>
              {renderCollection(featuredRest)}
            </section>
          )}

          {byCategory.map((cat) => (
            <section key={cat.name} className="px-5 pb-6 md:px-0">
              <h2 className="font-display mb-3 text-lg font-semibold">{cat.name}</h2>
              {renderCollection(cat.products)}
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="px-5 py-12 text-center text-muted md:px-0">
              Nenhum produto nesta categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
