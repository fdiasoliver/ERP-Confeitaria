import { prisma } from "@/lib/prisma";
import type { OccasionTag as PrismaOccasionTag } from "@prisma/client";

export async function findAllOccasions(): Promise<PrismaOccasionTag[]> {
  return prisma.occasionTag.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function findActiveOccasions(): Promise<PrismaOccasionTag[]> {
  return prisma.occasionTag.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findOccasionById(id: string): Promise<PrismaOccasionTag | null> {
  return prisma.occasionTag.findUnique({ where: { id } });
}

export async function findOccasionBySlug(slug: string): Promise<PrismaOccasionTag | null> {
  return prisma.occasionTag.findUnique({ where: { slug } });
}

export async function createOccasion(data: {
  name: string;
  slug: string;
  sortOrder?: number;
  color?: string;
  icon?: string;
}): Promise<PrismaOccasionTag> {
  return prisma.occasionTag.create({ data });
}

export async function updateOccasion(
  id: string,
  data: {
    name?: string;
    sortOrder?: number;
    color?: string;
    icon?: string;
  },
): Promise<PrismaOccasionTag> {
  return prisma.occasionTag.update({ where: { id }, data });
}

export async function activateOccasion(id: string): Promise<PrismaOccasionTag> {
  return prisma.occasionTag.update({ where: { id }, data: { isActive: true } });
}

export async function deactivateOccasion(id: string): Promise<PrismaOccasionTag> {
  return prisma.occasionTag.update({ where: { id }, data: { isActive: false } });
}

export async function countProductsByOccasion(id: string): Promise<number> {
  return prisma.productOccasion.count({ where: { occasionId: id } });
}
