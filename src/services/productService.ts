import type { Product } from "@/lib/types";

interface RawProductOccasion {
  occasion: { slug: string };
}

interface RawProduct {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  category?: { name?: string | null } | null;
  imageUrl?: string | null;
  basePrice: number | string;
  leadTimeDays: number;
  featured?: boolean | null;
  occasions?: RawProductOccasion[];
}

export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar produtos");

  const raw: RawProduct[] = await res.json();

  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? "",
    imageEmoji: "🎂",
    imageUrl: p.imageUrl ?? undefined,
    basePrice: Number(p.basePrice),
    leadTimeDays: p.leadTimeDays,
    featured: p.featured ?? false,
    occasions: (p.occasions ?? []).map((o) => o.occasion.slug),
  }));
}
