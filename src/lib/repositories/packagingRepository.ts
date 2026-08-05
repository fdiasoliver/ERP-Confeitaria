import { prisma } from "@/lib/prisma";
import type { Packaging as PrismaPackaging, Prisma } from "@prisma/client";

const withRelations = { category: true, supplier: true } satisfies Prisma.PackagingInclude;

export type PackagingWithRelations = Prisma.PackagingGetPayload<{ include: typeof withRelations }>;

export interface ListPackagingsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  active?: boolean;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function buildWhere(
  params: Pick<ListPackagingsParams, "search" | "categoryId" | "active">,
): Prisma.PackagingWhereInput {
  return {
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" } } : {}),
  };
}

// Sem paginação — consumo típico é popular um <select> de embalagens ativas em
// formulários (mesmo papel de listActiveIngredients/listActiveUnits).
export async function listActivePackagings(): Promise<PackagingWithRelations[]> {
  return prisma.packaging.findMany({
    where: { active: true },
    include: withRelations,
    orderBy: { name: "asc" },
  });
}

export async function findPackagingById(id: string): Promise<PackagingWithRelations | null> {
  return prisma.packaging.findUnique({ where: { id }, include: withRelations });
}

export async function findPackagingByName(name: string): Promise<PrismaPackaging | null> {
  return prisma.packaging.findFirst({ where: { name } });
}

export async function countPackagingsByCategory(categoryId: string): Promise<number> {
  return prisma.packaging.count({ where: { categoryId } });
}

// Listagem paginada — consumida pela página administrativa /admin/embalagens
// (mesmo padrão de listSuppliersPaged/listProductsPaged).
export async function listPackagingsPaged(
  params: ListPackagingsParams,
): Promise<PagedResult<PackagingWithRelations>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "name";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.packaging.findMany({
      where,
      include: withRelations,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.packaging.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createPackaging(data: {
  name: string;
  categoryId?: string | null;
  unitCost: number;
  stockQuantity?: number;
  minStock?: number;
  supplierId?: string | null;
}): Promise<PackagingWithRelations> {
  return prisma.packaging.create({ data, include: withRelations });
}

export async function updatePackaging(
  id: string,
  data: {
    name?: string;
    categoryId?: string | null;
    unitCost?: number;
    stockQuantity?: number;
    minStock?: number;
    supplierId?: string | null;
  },
): Promise<PackagingWithRelations> {
  return prisma.packaging.update({ where: { id }, data, include: withRelations });
}

// Sem hard delete — Packaging só é ativada/desativada, mesmo padrão de
// Ingredient/Recipe/Supplier/Product (nenhum tem endpoint DELETE).

export async function activatePackaging(id: string): Promise<PackagingWithRelations> {
  return prisma.packaging.update({ where: { id }, data: { active: true }, include: withRelations });
}

export async function deactivatePackaging(id: string): Promise<PackagingWithRelations> {
  return prisma.packaging.update({ where: { id }, data: { active: false }, include: withRelations });
}
