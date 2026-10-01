import { prisma } from "@/lib/prisma";
import type { PackagingCategory as PrismaPackagingCategory } from "@prisma/client";

export async function listAllPackagingCategories(): Promise<PrismaPackagingCategory[]> {
  return prisma.packagingCategory.findMany({ orderBy: { name: "asc" } });
}

export async function findPackagingCategoryById(id: string): Promise<PrismaPackagingCategory | null> {
  return prisma.packagingCategory.findUnique({ where: { id } });
}

export async function findPackagingCategoryByName(name: string): Promise<PrismaPackagingCategory | null> {
  return prisma.packagingCategory.findUnique({ where: { name } });
}

export async function createPackagingCategory(data: { name: string }): Promise<PrismaPackagingCategory> {
  return prisma.packagingCategory.create({ data });
}

export async function updatePackagingCategory(
  id: string,
  data: { name?: string },
): Promise<PrismaPackagingCategory> {
  return prisma.packagingCategory.update({ where: { id }, data });
}

export async function deletePackagingCategory(id: string): Promise<void> {
  await prisma.packagingCategory.delete({ where: { id } });
}

// Exclusão com transferência (01/10/2026): move os itens vinculados para a
// categoria de destino (ou para "sem categoria", quando `targetId` é null) e
// exclui a categoria na mesma transação — nada muda se uma etapa falhar.
export async function transferPackagingsAndDeleteCategory(id: string, targetId: string | null): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const moved = await tx.packaging.updateMany({ where: { categoryId: id }, data: { categoryId: targetId } });
    await tx.packagingCategory.delete({ where: { id } });
    return moved.count;
  });
}
