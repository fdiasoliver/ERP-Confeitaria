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
