import type { ValidationError } from "@/lib/types";
import {
  validateProductPackagingItem,
  validateProductPackagingItemUpdate,
} from "@/lib/validators/productPackagingValidator";
import {
  findLinkById,
  findLinkByProductAndPackaging,
  listLinksByProduct,
  listLinksByPackaging,
  createLink,
  updateLink,
  deleteLink,
  type ProductPackagingWithPackaging,
  type ProductPackagingWithProduct,
} from "@/lib/repositories/productPackagingRepository";
import { findProductById } from "@/lib/repositories/productRepository";
import { findPackagingById } from "@/lib/repositories/packagingRepository";

// Referências cruzadas (produto/embalagem) resolvidas via Repository, não via
// Service (productService.getProductById/packagingService.getPackagingById) —
// mirror de recipeService.assertIngredientUsable (chama findIngredientById do
// Repository diretamente), não do padrão mais pesado de productService.
// assertRecipesUsable (chama recipeService.getRecipeById via try/catch). Aqui só
// existência + campo `active` são necessários, sem precisar do DTO completo —
// menos acoplamento entre Services (Fase 7, "existe acoplamento desnecessário?").

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class ProductPackagingNotFoundError extends Error {
  constructor(public id: string) {
    super(`Vínculo de embalagem não encontrado: ${id}`);
  }
}

export class ProductPackagingValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class InvalidProductReferenceError extends Error {
  constructor(public productId: string) {
    super(`Produto não encontrado: ${productId}`);
  }
}

export class InvalidPackagingReferenceError extends Error {
  constructor(public packagingId: string) {
    super(`Embalagem não encontrada: ${packagingId}`);
  }
}

export class InactivePackagingError extends Error {
  constructor(public packagingName: string) {
    super(`Embalagem "${packagingName}" está inativa e não pode ser vinculada a produtos.`);
  }
}

export class DuplicatePackagingInProductError extends Error {
  constructor(public packagingId: string) {
    super("Esta embalagem já está vinculada a este produto.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface ProductPackagingDTO {
  id: string;
  productId: string;
  packagingId: string;
  packagingName: string;
  unitCost: number;
  quantity: number;
}

export interface PackagingUsageDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
}

function mapLink(link: ProductPackagingWithPackaging): ProductPackagingDTO {
  return {
    id: link.id,
    productId: link.productId,
    packagingId: link.packagingId,
    packagingName: link.packaging.name,
    unitCost: link.packaging.unitCost.toNumber(),
    quantity: link.quantity,
  };
}

function mapUsage(link: ProductPackagingWithProduct): PackagingUsageDTO {
  return {
    id: link.id,
    productId: link.productId,
    productName: link.product.name,
    quantity: link.quantity,
  };
}

// ─── Validação cruzada de referências ────────────────────────────────────────

async function assertProductExists(productId: string): Promise<void> {
  const product = await findProductById(productId);
  if (!product) throw new InvalidProductReferenceError(productId);
}

// "Embalagem inativa não pode ser adicionada a novos vínculos com produto"
// (MODULE_2H_PLANNING.md Regra 7 / REGRAS_NEGOCIO.md Seção 8.1).
async function assertPackagingUsable(packagingId: string): Promise<void> {
  const packaging = await findPackagingById(packagingId);
  if (!packaging) throw new InvalidPackagingReferenceError(packagingId);
  if (!packaging.active) throw new InactivePackagingError(packaging.name);
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listProductPackagings(productId: string): Promise<ProductPackagingDTO[]> {
  await assertProductExists(productId);
  const links = await listLinksByProduct(productId);
  return links.map(mapLink);
}

// Painel "Usado em N produtos" — MODULE_2H_PLANNING.md Seção 6.3/Fase 4. Só a
// existência importa aqui (não o estado ativo) — consultar o uso de uma
// embalagem já inativa é uma operação de leitura legítima, por isso usa
// findPackagingById diretamente em vez de assertPackagingUsable.
export async function listPackagingUsage(packagingId: string): Promise<PackagingUsageDTO[]> {
  const packaging = await findPackagingById(packagingId);
  if (!packaging) throw new InvalidPackagingReferenceError(packagingId);

  const links = await listLinksByPackaging(packagingId);
  return links.map(mapUsage);
}

// ─── Vincular embalagem a produto ────────────────────────────────────────────
//
// Fluxo: produto existe → validator estrutural → embalagem existe e ativa →
// não duplicada no mesmo produto → Repository → map.
// Sem transação: uma única escrita (createLink) após checagens de leitura —
// nada a coordenar atomicamente (Fase 5).

export async function addProductPackaging(
  productId: string,
  input: { packagingId: string; quantity: number },
): Promise<ProductPackagingDTO> {
  await assertProductExists(productId);

  const errors = validateProductPackagingItem(input);
  if (errors.length > 0) throw new ProductPackagingValidationFailedError(errors);

  await assertPackagingUsable(input.packagingId);

  const duplicate = await findLinkByProductAndPackaging(productId, input.packagingId);
  if (duplicate) throw new DuplicatePackagingInProductError(input.packagingId);

  const created = await createLink({ productId, packagingId: input.packagingId, quantity: input.quantity });
  return mapLink(created);
}

export async function updateProductPackagingQuantity(
  productId: string,
  linkId: string,
  input: { quantity?: number },
): Promise<ProductPackagingDTO> {
  await assertProductExists(productId);

  const link = await findLinkById(linkId);
  if (!link || link.productId !== productId) throw new ProductPackagingNotFoundError(linkId);

  const errors = validateProductPackagingItemUpdate(input);
  if (errors.length > 0) throw new ProductPackagingValidationFailedError(errors);

  const updated = await updateLink(linkId, { quantity: input.quantity });
  return mapLink(updated);
}

export async function removeProductPackaging(productId: string, linkId: string): Promise<void> {
  await assertProductExists(productId);

  const link = await findLinkById(linkId);
  if (!link || link.productId !== productId) throw new ProductPackagingNotFoundError(linkId);

  await deleteLink(linkId);
}
