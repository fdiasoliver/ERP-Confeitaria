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
