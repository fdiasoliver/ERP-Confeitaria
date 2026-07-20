import { prisma } from "@/lib/prisma";
import type { UnitOfMeasure as PrismaUnitOfMeasure, UnitType } from "@prisma/client";

export async function listAllUnits(): Promise<PrismaUnitOfMeasure[]> {
  return prisma.unitOfMeasure.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function listActiveUnits(): Promise<PrismaUnitOfMeasure[]> {
  return prisma.unitOfMeasure.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findUnitById(id: string): Promise<PrismaUnitOfMeasure | null> {
  return prisma.unitOfMeasure.findUnique({ where: { id } });
}

export async function findUnitByName(name: string): Promise<PrismaUnitOfMeasure | null> {
  return prisma.unitOfMeasure.findUnique({ where: { name } });
}

export async function findUnitByAbbreviation(abbreviation: string): Promise<PrismaUnitOfMeasure | null> {
  return prisma.unitOfMeasure.findUnique({ where: { abbreviation } });
}

export async function createUnit(data: {
  name: string;
  abbreviation: string;
  type: UnitType;
  sortOrder?: number;
}): Promise<PrismaUnitOfMeasure> {
  return prisma.unitOfMeasure.create({ data });
}

export async function updateUnit(
  id: string,
  data: {
    name?: string;
    abbreviation?: string;
    type?: UnitType;
    sortOrder?: number;
  },
): Promise<PrismaUnitOfMeasure> {
  return prisma.unitOfMeasure.update({ where: { id }, data });
}

export async function activateUnit(id: string): Promise<PrismaUnitOfMeasure> {
  return prisma.unitOfMeasure.update({ where: { id }, data: { isActive: true } });
}

export async function deactivateUnit(id: string): Promise<PrismaUnitOfMeasure> {
  return prisma.unitOfMeasure.update({ where: { id }, data: { isActive: false } });
}
