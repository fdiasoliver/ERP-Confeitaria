import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const withRelations = {
  ingredient: true,
  unit: true,
} satisfies Prisma.RecipeIngredientInclude;

export type RecipeIngredientWithRelations = Prisma.RecipeIngredientGetPayload<{
  include: typeof withRelations;
}>;

export async function findItemById(id: string): Promise<RecipeIngredientWithRelations | null> {
  return prisma.recipeIngredient.findUnique({ where: { id }, include: withRelations });
}

export async function findItemByRecipeAndIngredient(
  recipeId: string,
  ingredientId: string,
): Promise<RecipeIngredientWithRelations | null> {
  return prisma.recipeIngredient.findUnique({
    where: { recipeId_ingredientId: { recipeId, ingredientId } },
    include: withRelations,
  });
}

export async function countItemsByRecipe(recipeId: string): Promise<number> {
  return prisma.recipeIngredient.count({ where: { recipeId } });
}

export async function createItem(data: {
  recipeId: string;
  ingredientId: string;
  quantity: number;
  unitId: string;
}): Promise<RecipeIngredientWithRelations> {
  return prisma.recipeIngredient.create({ data, include: withRelations });
}

export async function updateItem(
  id: string,
  data: { quantity?: number; unitId?: string },
): Promise<RecipeIngredientWithRelations> {
  return prisma.recipeIngredient.update({ where: { id }, data, include: withRelations });
}

export async function deleteItem(id: string): Promise<void> {
  await prisma.recipeIngredient.delete({ where: { id } });
}
