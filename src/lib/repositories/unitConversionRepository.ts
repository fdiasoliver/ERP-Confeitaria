import { prisma } from "@/lib/prisma";
import type { UnitConversion as PrismaUnitConversion, Prisma } from "@prisma/client";

const withUnits = { fromUnit: true, toUnit: true } satisfies Prisma.UnitConversionInclude;

export type UnitConversionWithUnits = Prisma.UnitConversionGetPayload<{ include: typeof withUnits }>;

export async function listAllConversions(): Promise<UnitConversionWithUnits[]> {
  return prisma.unitConversion.findMany({
    include: withUnits,
    orderBy: [{ fromUnit: { name: "asc" } }, { toUnit: { name: "asc" } }],
  });
}

export async function findConversionById(id: string): Promise<UnitConversionWithUnits | null> {
  return prisma.unitConversion.findUnique({ where: { id }, include: withUnits });
}

export async function findConversion(
  fromUnitId: string,
  toUnitId: string,
): Promise<PrismaUnitConversion | null> {
  return prisma.unitConversion.findUnique({
    where: { fromUnitId_toUnitId: { fromUnitId, toUnitId } },
  });
}

export async function createConversion(data: {
  fromUnitId: string;
  toUnitId: string;
  factor: number;
  description?: string;
}): Promise<UnitConversionWithUnits> {
  return prisma.unitConversion.create({ data, include: withUnits });
}

export async function updateConversion(
  id: string,
  data: {
    fromUnitId?: string;
    toUnitId?: string;
    factor?: number;
    description?: string | null;
  },
): Promise<UnitConversionWithUnits> {
  return prisma.unitConversion.update({ where: { id }, data, include: withUnits });
}

export async function deleteConversion(id: string): Promise<void> {
  await prisma.unitConversion.delete({ where: { id } });
}
