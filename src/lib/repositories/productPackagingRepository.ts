import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ProductPackaging é estruturalmente igual a ProductRecipe (join productId+X+quantity),
// mas ProductRecipe não tem repository dedicado — é gravado via nested write dentro de
// productRepository.ts (deleteMany + create, dentro de transação, no update). Este
// arquivo segue, em vez disso, o padrão de recipeIngredientRepository.ts (item de junção
// com repository próprio), por exigência explícita da Ordem de Missão da Sprint 2.H.2
// (Fase 2: "ProductPackagingRepository" como um dos repositories mínimos). Mantém as
// duas direções de consulta com o include mínimo necessário para cada uma — nenhuma
// decisão sobre como a Sprint 2.H.3 (Service) vai orquestrar a escrita (item a item,
// como RecipeIngredient, ou substituição em lote, como ProductRecipe) é tomada aqui.

const withPackaging = { packaging: true } satisfies Prisma.ProductPackagingInclude;
const withProduct = { product: true } satisfies Prisma.ProductPackagingInclude;

export type ProductPackagingWithPackaging = Prisma.ProductPackagingGetPayload<{ include: typeof withPackaging }>;
export type ProductPackagingWithProduct = Prisma.ProductPackagingGetPayload<{ include: typeof withProduct }>;

export async function findLinkById(id: string): Promise<ProductPackagingWithPackaging | null> {
  return prisma.productPackaging.findUnique({ where: { id }, include: withPackaging });
}

export async function findLinkByProductAndPackaging(
  productId: string,
  packagingId: string,
): Promise<ProductPackagingWithPackaging | null> {
  return prisma.productPackaging.findUnique({
    where: { productId_packagingId: { productId, packagingId } },
    include: withPackaging,
  });
}

// Direção "quanto custa a embalagem deste produto" — consumida pelo cálculo de
// costPrice (Sprint 2.H.3) e pelo formulário de Produto.
export async function listLinksByProduct(productId: string): Promise<ProductPackagingWithPackaging[]> {
  return prisma.productPackaging.findMany({ where: { productId }, include: withPackaging });
}

// Direção "em quais produtos esta embalagem é usada" — consumida pelo painel
// "Usado em N produtos" do detalhe de embalagem (MODULE_2H_PLANNING.md Seção 6.3).
export async function listLinksByPackaging(packagingId: string): Promise<ProductPackagingWithProduct[]> {
  return prisma.productPackaging.findMany({ where: { packagingId }, include: withProduct });
}

export async function countLinksByPackaging(packagingId: string): Promise<number> {
  return prisma.productPackaging.count({ where: { packagingId } });
}

export async function createLink(data: {
  productId: string;
  packagingId: string;
  quantity: number;
}): Promise<ProductPackagingWithPackaging> {
  return prisma.productPackaging.create({ data, include: withPackaging });
}

export async function updateLink(
  id: string,
  data: { quantity?: number },
): Promise<ProductPackagingWithPackaging> {
  return prisma.productPackaging.update({ where: { id }, data, include: withPackaging });
}

export async function deleteLink(id: string): Promise<void> {
  await prisma.productPackaging.delete({ where: { id } });
}
