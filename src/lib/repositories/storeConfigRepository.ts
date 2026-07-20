import { prisma } from "@/lib/prisma";
import type { Prisma, StoreConfig as PrismaStoreConfig } from "@prisma/client";

export async function findStoreConfig(): Promise<PrismaStoreConfig | null> {
  return prisma.storeConfig.findFirst();
}

export async function updateStoreConfig(
  id: string,
  data: Prisma.StoreConfigUpdateInput,
): Promise<PrismaStoreConfig> {
  return prisma.storeConfig.update({ where: { id }, data });
}

export async function createStoreConfig(
  data: Prisma.StoreConfigCreateInput,
): Promise<PrismaStoreConfig> {
  return prisma.storeConfig.create({ data });
}
