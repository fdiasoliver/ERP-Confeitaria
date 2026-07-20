import { prisma } from "@/lib/prisma";
import type { Ingredient as PrismaIngredient, IngredientPriceHistory, PriceSource, Prisma } from "@prisma/client";

const withRelations = { category: true, unit: true } satisfies Prisma.IngredientInclude;

export type IngredientWithRelations = Prisma.IngredientGetPayload<{ include: typeof withRelations }>;

export async function listAllIngredients(): Promise<IngredientWithRelations[]> {
  return prisma.ingredient.findMany({
    include: withRelations,
    orderBy: { name: "asc" },
  });
}

export async function listActiveIngredients(): Promise<IngredientWithRelations[]> {
  return prisma.ingredient.findMany({
    where: { active: true },
    include: withRelations,
    orderBy: { name: "asc" },
  });
}

export async function findIngredientById(id: string): Promise<IngredientWithRelations | null> {
  return prisma.ingredient.findUnique({ where: { id }, include: withRelations });
}

export async function findIngredientByName(name: string): Promise<PrismaIngredient | null> {
  return prisma.ingredient.findFirst({ where: { name } });
}

export async function countIngredientsByCategory(categoryId: string): Promise<number> {
  return prisma.ingredient.count({ where: { categoryId } });
}

export async function createIngredient(data: {
  name: string;
  categoryId?: string | null;
  unitId: string;
  currentPrice: number;
  stockQuantity?: number;
  minStock?: number;
  supplier?: string | null;
  externalCode?: string | null;
  externalSource?: PriceSource | null;
}): Promise<IngredientWithRelations> {
  return prisma.ingredient.create({ data, include: withRelations });
}

export async function updateIngredient(
  id: string,
  data: {
    name?: string;
    categoryId?: string | null;
    unitId?: string;
    currentPrice?: number;
    stockQuantity?: number;
    minStock?: number;
    supplier?: string | null;
    externalCode?: string | null;
    externalSource?: PriceSource | null;
  },
): Promise<IngredientWithRelations> {
  return prisma.ingredient.update({ where: { id }, data, include: withRelations });
}

export async function activateIngredient(id: string): Promise<IngredientWithRelations> {
  return prisma.ingredient.update({ where: { id }, data: { active: true }, include: withRelations });
}

export async function deactivateIngredient(id: string): Promise<IngredientWithRelations> {
  return prisma.ingredient.update({ where: { id }, data: { active: false }, include: withRelations });
}

// ─── Histórico de preço ───────────────────────────────────────────────────────

export async function addPriceHistoryEntry(data: {
  ingredientId: string;
  price: number;
  source: PriceSource;
  notes?: string;
}): Promise<IngredientPriceHistory> {
  return prisma.ingredientPriceHistory.create({ data });
}

export async function listPriceHistory(ingredientId: string): Promise<IngredientPriceHistory[]> {
  return prisma.ingredientPriceHistory.findMany({
    where: { ingredientId },
    orderBy: { recordedAt: "desc" },
  });
}
