import { prisma } from "@/lib/prisma";
import type { SalesChannel as PrismaSalesChannel } from "@prisma/client";

export async function findActiveChannels(): Promise<PrismaSalesChannel[]> {
  return prisma.salesChannel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findAllChannels(): Promise<PrismaSalesChannel[]> {
  return prisma.salesChannel.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function findChannelById(id: string): Promise<PrismaSalesChannel | null> {
  return prisma.salesChannel.findUnique({ where: { id } });
}

export async function findChannelBySlug(slug: string): Promise<PrismaSalesChannel | null> {
  return prisma.salesChannel.findUnique({ where: { slug } });
}

export async function createChannel(data: {
  name: string;
  slug: string;
  sortOrder?: number;
  color?: string;
  icon?: string;
}): Promise<PrismaSalesChannel> {
  return prisma.salesChannel.create({ data });
}

export async function updateChannel(
  id: string,
  data: {
    name?: string;
    sortOrder?: number;
    color?: string;
    icon?: string;
  },
): Promise<PrismaSalesChannel> {
  return prisma.salesChannel.update({ where: { id }, data });
}

export async function activateChannel(id: string): Promise<PrismaSalesChannel> {
  return prisma.salesChannel.update({ where: { id }, data: { isActive: true } });
}

export async function deactivateChannel(id: string): Promise<PrismaSalesChannel> {
  return prisma.salesChannel.update({ where: { id }, data: { isActive: false } });
}
