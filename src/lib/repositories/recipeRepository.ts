import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const withItems = {
  items: { include: { ingredient: true, unit: true } },
} satisfies Prisma.RecipeInclude;

export type RecipeWithItems = Prisma.RecipeGetPayload<{ include: typeof withItems }>;

export async function listAllRecipes(): Promise<RecipeWithItems[]> {
  return prisma.recipe.findMany({ include: withItems, orderBy: { name: "asc" } });
}

export async function listActiveRecipes(): Promise<RecipeWithItems[]> {
  return prisma.recipe.findMany({
    where: { active: true },
    include: withItems,
    orderBy: { name: "asc" },
  });
}

export async function findRecipeById(id: string): Promise<RecipeWithItems | null> {
  return prisma.recipe.findUnique({ where: { id }, include: withItems });
}

export async function findRecipeByName(name: string): Promise<{ id: string; name: string } | null> {
  return prisma.recipe.findFirst({ where: { name }, select: { id: true, name: true } });
}

export async function createRecipeWithItems(data: {
  name: string;
  description?: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes?: number;
  items: { ingredientId: string; quantity: number; unitId: string }[];
}): Promise<RecipeWithItems> {
  return prisma.recipe.create({
    data: {
      name: data.name,
      description: data.description,
      yieldQuantity: data.yieldQuantity,
      yieldUnit: data.yieldUnit,
      prepTimeMinutes: data.prepTimeMinutes,
      items: { create: data.items },
    },
    include: withItems,
  });
}

export async function updateRecipe(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTimeMinutes?: number;
  },
): Promise<RecipeWithItems> {
  return prisma.recipe.update({ where: { id }, data, include: withItems });
}

export async function activateRecipe(id: string): Promise<RecipeWithItems> {
  return prisma.recipe.update({ where: { id }, data: { active: true }, include: withItems });
}

export async function deactivateRecipe(id: string): Promise<RecipeWithItems> {
  return prisma.recipe.update({ where: { id }, data: { active: false }, include: withItems });
}
