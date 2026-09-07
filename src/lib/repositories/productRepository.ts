import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const withRelations = {
  category: true,
  recipes: true,
  packagings: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof withRelations }>;

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  active?: boolean;
  orderBy?: "name" | "basePrice" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function buildWhere(params: Pick<ListProductsParams, "search" | "categoryId" | "active">): Prisma.ProductWhereInput {
  return {
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" } } : {}),
  };
}

export async function findAllProducts(): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({ include: withRelations, orderBy: { name: "asc" } });
}

export async function findProductById(id: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({ where: { id }, include: withRelations });
}

export async function productExists(id: string): Promise<boolean> {
  const count = await prisma.product.count({ where: { id } });
  return count > 0;
}

export async function countProductUsage(id: string): Promise<number> {
  return prisma.orderItem.count({ where: { productId: id } });
}

export async function searchProducts(query: string): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({
    where: { name: { contains: query, mode: "insensitive" } },
    include: withRelations,
    orderBy: { name: "asc" },
    take: 20,
  });
}

export async function listProductsPaged(params: ListProductsParams): Promise<PagedResult<ProductWithRelations>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "name";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: withRelations,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createProduct(data: {
  name: string;
  description?: string | null;
  categoryId: string;
  imageUrl?: string | null;
  basePrice: number;
  leadTimeDays?: number;
  featured?: boolean;
  recipes?: { recipeId: string; quantity: number }[];
}): Promise<ProductWithRelations> {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      basePrice: data.basePrice,
      leadTimeDays: data.leadTimeDays,
      featured: data.featured,
      recipes: data.recipes ? { create: data.recipes } : undefined,
    },
    include: withRelations,
  });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    categoryId?: string;
    imageUrl?: string | null;
    basePrice?: number;
    leadTimeDays?: number;
    featured?: boolean;
    recipes?: { recipeId: string; quantity: number }[];
  },
): Promise<ProductWithRelations> {
  return prisma.$transaction(async (tx) => {
    if (data.recipes !== undefined) {
      await tx.productRecipe.deleteMany({ where: { productId: id } });
    }
    return tx.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
        basePrice: data.basePrice,
        leadTimeDays: data.leadTimeDays,
        featured: data.featured,
        recipes: data.recipes ? { create: data.recipes } : undefined,
      },
      include: withRelations,
    });
  });
}

export async function activateProduct(id: string): Promise<ProductWithRelations> {
  return prisma.product.update({ where: { id }, data: { active: true }, include: withRelations });
}

export async function deactivateProduct(id: string): Promise<ProductWithRelations> {
  return prisma.product.update({ where: { id }, data: { active: false }, include: withRelations });
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
