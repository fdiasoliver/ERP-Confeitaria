import { prisma } from "@/lib/prisma";
import type { ProductCategory as PrismaProductCategory } from "@prisma/client";

export async function findActiveCategories(): Promise<PrismaProductCategory[]> {
  return prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findAllCategories(): Promise<PrismaProductCategory[]> {
  return prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function findAllCategoriesWithCount(): Promise<(PrismaProductCategory & { _count: { products: number } })[]> {
  return prisma.productCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function findCategoryById(id: string): Promise<PrismaProductCategory | null> {
  return prisma.productCategory.findUnique({ where: { id } });
}

export async function findCategoryBySlug(slug: string): Promise<PrismaProductCategory | null> {
  return prisma.productCategory.findUnique({ where: { slug } });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  sortOrder?: number;
  color?: string;
  icon?: string;
}): Promise<PrismaProductCategory> {
  return prisma.productCategory.create({ data });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    sortOrder?: number;
    color?: string;
    icon?: string;
  },
): Promise<PrismaProductCategory> {
  return prisma.productCategory.update({ where: { id }, data });
}

export async function activateCategory(id: string): Promise<PrismaProductCategory> {
  return prisma.productCategory.update({ where: { id }, data: { isActive: true } });
}

export async function deactivateCategory(id: string): Promise<PrismaProductCategory> {
  return prisma.productCategory.update({ where: { id }, data: { isActive: false } });
}

export async function countProductsByCategory(id: string): Promise<number> {
  return prisma.product.count({ where: { categoryId: id } });
}

// Exclusão com transferência (01/10/2026): move os itens vinculados para a
// categoria de destino (ou para "sem categoria", quando `targetId` é null) e
// exclui a categoria na mesma transação — nada muda se uma etapa falhar.
// Product.categoryId é obrigatório — destino sempre informado quando há
// produtos. Despesas ligadas à categoria (centro de custo) também vão para o
// destino; sem destino, o onDelete: SetNull do schema as deixa sem categoria.
export async function transferProductsAndDeleteCategory(id: string, targetId: string | null): Promise<number> {
  return prisma.$transaction(async (tx) => {
    let moved = 0;
    if (targetId) {
      moved = (await tx.product.updateMany({ where: { categoryId: id }, data: { categoryId: targetId } })).count;
      await tx.expense.updateMany({ where: { productCategoryId: id }, data: { productCategoryId: targetId } });
    }
    await tx.productCategory.delete({ where: { id } });
    return moved;
  });
}
