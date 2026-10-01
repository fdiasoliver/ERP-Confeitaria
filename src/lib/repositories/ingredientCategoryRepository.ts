import { prisma } from "@/lib/prisma";
import type { IngredientCategory as PrismaIngredientCategory } from "@prisma/client";

export async function listAllIngredientCategories(): Promise<PrismaIngredientCategory[]> {
  return prisma.ingredientCategory.findMany({ orderBy: { name: "asc" } });
}

export async function findIngredientCategoryById(id: string): Promise<PrismaIngredientCategory | null> {
  return prisma.ingredientCategory.findUnique({ where: { id } });
}

export async function findIngredientCategoryByName(name: string): Promise<PrismaIngredientCategory | null> {
  return prisma.ingredientCategory.findUnique({ where: { name } });
}

export async function createIngredientCategory(data: { name: string }): Promise<PrismaIngredientCategory> {
  return prisma.ingredientCategory.create({ data });
}

export async function updateIngredientCategory(
  id: string,
  data: { name?: string },
): Promise<PrismaIngredientCategory> {
  return prisma.ingredientCategory.update({ where: { id }, data });
}

export async function deleteIngredientCategory(id: string): Promise<void> {
  await prisma.ingredientCategory.delete({ where: { id } });
}

// Exclusão com transferência (01/10/2026): move os itens vinculados para a
// categoria de destino (ou para "sem categoria", quando `targetId` é null) e
// exclui a categoria na mesma transação — nada muda se uma etapa falhar.
export async function transferIngredientsAndDeleteCategory(id: string, targetId: string | null): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const moved = await tx.ingredient.updateMany({ where: { categoryId: id }, data: { categoryId: targetId } });
    await tx.ingredientCategory.delete({ where: { id } });
    return moved.count;
  });
}
