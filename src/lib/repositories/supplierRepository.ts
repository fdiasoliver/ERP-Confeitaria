import { prisma } from "@/lib/prisma";
import type { Prisma, Supplier } from "@prisma/client";

export interface ListSuppliersParams {
  page?: number;
  pageSize?: number;
  search?: string;
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

function buildWhere(params: Pick<ListSuppliersParams, "search" | "active">): Prisma.SupplierWhereInput {
  return {
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" } } : {}),
  };
}

export async function findSupplierById(id: string): Promise<Supplier | null> {
  return prisma.supplier.findUnique({ where: { id } });
}

export async function findSupplierByCnpj(cnpj: string): Promise<Supplier | null> {
  return prisma.supplier.findUnique({ where: { cnpj } });
}

export async function listSuppliersPaged(params: ListSuppliersParams): Promise<PagedResult<Supplier>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "name";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplier.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createSupplier(data: {
  name: string;
  phone?: string | null;
  cnpj?: string | null;
  leadTimeDays?: number | null;
  notes?: string | null;
}): Promise<Supplier> {
  return prisma.supplier.create({ data });
}

export async function updateSupplier(
  id: string,
  data: {
    name?: string;
    phone?: string | null;
    cnpj?: string | null;
    leadTimeDays?: number | null;
    notes?: string | null;
  },
): Promise<Supplier> {
  return prisma.supplier.update({ where: { id }, data });
}

// Soft delete: o projeto não usa deletedAt/restore — o padrão consolidado (Unit,
// Ingredient, Recipe, Product) é o campo `active` alternado via activate/deactivate.
// "Restore" do escopo desta sprint corresponde a activateSupplier.

export async function activateSupplier(id: string): Promise<Supplier> {
  return prisma.supplier.update({ where: { id }, data: { active: true } });
}

export async function deactivateSupplier(id: string): Promise<Supplier> {
  return prisma.supplier.update({ where: { id }, data: { active: false } });
}
