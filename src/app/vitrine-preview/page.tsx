"use client";

import { useEffect, useMemo, useState } from "react";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CategoryChips } from "@/components/vitrine/ProductCard";
import { ProductDetailDialog } from "@/components/vitrine/ProductDetailDialog";
import {
  PreviewBottomBar,
  PreviewCover,
  PreviewProductRow,
  PreviewStoreCard,
  PreviewStoreInfoDialog,
  type PreviewStoreInfo,
} from "@/components/vitrine-preview/PreviewParts";
import { useCart } from "@/context/CartContext";
import { OCCASIONS as OCCASIONS_FALLBACK, PRODUCTS as MOCK_PRODUCTS } from "@/lib/mock-data";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

// Tela paralela de PRÉ-VISUALIZAÇÃO (24/09/2026): Vitrine mobile no formato da
// referência (capa + cartão da loja + itens em linha + barra inferior). Só
// visual — nenhum campo novo no banco. Valores marcados como EXEMPLO abaixo
// ainda não existem no StoreConfig (horário de funcionamento, slogan, capa).
const EXAMPLE_OPEN_UNTIL = "18:00";
const EXAMPLE_SLOGAN = "Doces artesanais feitos sob encomenda";

interface Occasion {
  id: string;
  name: string;
}

const ALL_OCCASION: Occasion = { id: "all", name: "Todos" };

interface ConfigResponse {
  name?: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
}

function buildAddress(c: ConfigResponse): string | null {
  const line1 = [c.addressStreet, c.addressNumber].filter(Boolean).join(", ");
  const line2 = [c.addressNeighborhood, c.addressCity && c.addressState ? `${c.addressCity}/${c.addressState}` : c.addressCity]
    .filter(Boolean)
    .join(" — ");
  return [line1, line2].filter(Boolean).join(" · ") || null;
}

export default function VitrinePreviewPage() {
  const [occasion, setOccasion] = useState("all");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [occasions, setOccasions] = useState<Occasion[]>([ALL_OCCASION, ...OCCASIONS_FALLBACK]);
  const [store, setStore] = useState<PreviewStoreInfo>({
    name: "Doce Menina",
    logoUrl: null,
    phone: null,
    email: null,
    instagram: null,
    address: null,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts(MOCK_PRODUCTS));
  }, []);

  useEffect(() => {
    fetch("/api/occasions", { cache: "no-store" })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) return;
        const list: { name: string; slug: string }[] = result.data;
        setOccasions([ALL_OCCASION, ...list.map((t) => ({ id: t.slug, name: t.name }))]);
      })
      .catch(() => {});
  }, []);

  // GET /api/config devolve o StoreConfig direto, sem envelope {success,data}.
  useEffect(() => {
    fetch("/api/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((c: ConfigResponse) => {
        if (!c?.name) return;
        setStore({
          name: c.name,
          logoUrl: c.logoUrl ?? null,
          phone: c.phone ?? null,
          email: c.email ?? null,
          instagram: c.instagram ?? null,
          address: buildAddress(c),
        });
      })
      .catch(() => {});
  }, []);

  const quantities = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => { map[i.productId] = i.quantity; });
    return map;
  }, [items]);

  const filtered = useMemo(
    () => (occasion === "all" ? products : products.filter((p) => p.occasions.includes(occasion))),
    [occasion, products],
  );

  const sections = useMemo(() => {
    const result: { name: string; products: Product[] }[] = [];
    const featured = filtered.filter((p) => p.featured);
    if (featured.length > 0) result.push({ name: "Destaques", products: featured });

    const seen = new Set<string>();
    const order: string[] = [];
    products.forEach((p) => {
      if (!seen.has(p.categoryName)) {
        seen.add(p.categoryName);
        order.push(p.categoryName);
      }
    });
    order.forEach((name) => {
      const list = filtered.filter((p) => p.categoryName === name && !p.featured);
      if (list.length > 0) result.push({ name, products: list });
    });
    return result;
  }, [products, filtered]);

  // Prazo de encomenda derivado do catálogo real — substitui o "10–50 min" da
  // referência (entrega imediata), que não se aplica a encomenda.
  const leadTimeLabel = useMemo(() => {
    if (products.length === 0) return null;
    const days = products.map((p) => p.leadTimeDays);
    const min = Math.min(...days);
    const max = Math.max(...days);
    const unit = (n: number) => (n === 1 ? "dia" : "dias");
    if (min === max) return `Encomendas com ${max} ${unit(max)} de antecedência`;
    // Produto com prazo 0 (pronta-entrega) não deve aparecer como "0 a N dias".
    return min <= 1
      ? `Encomendas com até ${max} ${unit(max)} de antecedência`
      : `Encomendas com ${min} a ${max} ${unit(max)} de antecedência`;
  }, [products]);

  // Só para pré-visualizar o efeito da capa: foto de um produto real.
  const coverImage = products.find((p) => p.imageUrl)?.imageUrl;

  return (
    <div className="min-h-screen bg-sand/60">
      <div className="mx-auto min-h-screen max-w-app bg-cream pb-40 shadow-card">
        <PreviewCover imageUrl={coverImage} />
        <PreviewStoreCard
          store={store}
          slogan={EXAMPLE_SLOGAN}
          openUntil={EXAMPLE_OPEN_UNTIL}
          leadTimeLabel={leadTimeLabel}
          onOpenInfo={() => setInfoOpen(true)}
        />

        <div className="sticky top-0 z-10 mt-2 border-b border-sand bg-cream/95 backdrop-blur">
          <CategoryChips occasions={occasions} selected={occasion} onSelect={setOccasion} />
        </div>

        <main className="px-5">
          {sections.map((section) => (
            <section key={section.name} className="pt-6">
              <h2 className="font-display text-xl font-extrabold text-chocolate">{section.name}</h2>
              <div className="mt-1">
                {section.products.map((product) => (
                  <PreviewProductRow
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] ?? 0}
                    onOpenDetails={setSelectedProduct}
                  />
                ))}
              </div>
            </section>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-muted">Nenhum produto nesta categoria.</p>
          )}
        </main>
      </div>

      <PreviewBottomBar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <PreviewStoreInfoDialog
        store={store}
        openUntil={EXAMPLE_OPEN_UNTIL}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
      <ProductDetailDialog
        product={selectedProduct}
        quantity={selectedProduct ? quantities[selectedProduct.id] ?? 0 : 0}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
