import type { ValidationError, StoreConfig } from "@/lib/types";
import {
  findAllProducts,
  findProductById,
  productExists,
  countProductUsage,
  searchProducts as searchProductsInRepo,
  listProductsPaged as listProductsPagedInRepo,
  createProduct as createProductInRepo,
  updateProduct as updateProductInRepo,
  activateProduct as activateProductInRepo,
  deactivateProduct as deactivateProductInRepo,
  deleteProduct as deleteProductInRepo,
  type ProductWithRelations,
  type ListProductsParams,
} from "@/lib/repositories/productRepository";
import { findCategoryById } from "@/lib/repositories/productCategoryRepository";
import { getRecipeById } from "@/lib/recipeService";
import { getPackagingById } from "@/lib/packagingService";
import { getStoreConfig } from "@/lib/storeConfigService";
import {
  validateProductCreate,
  validateProductUpdate,
  type ProductInput,
  type ProductRecipeInput,
} from "@/lib/validators/productValidator";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class ProductNotFoundError extends Error {
  constructor(public id: string) {
    super(`Produto não encontrado: ${id}`);
  }
}

export class ProductValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class InvalidCategoryReferenceError extends Error {
  constructor(public categoryId: string) {
    super(`Categoria não encontrada: ${categoryId}`);
  }
}

export class InactiveCategoryError extends Error {
  constructor(public categoryName: string) {
    super(`Categoria "${categoryName}" está inativa e não pode receber novos produtos.`);
  }
}

export class InvalidRecipeReferenceError extends Error {
  constructor(public recipeId: string) {
    super(`Receita não encontrada: ${recipeId}`);
  }
}

export class ProductInUseError extends Error {
  constructor(
    public id: string,
    public usageCount: number,
  ) {
    super(`Produto não pode ser excluído: está em uso em ${usageCount} pedido(s).`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface ProductRecipeDTO {
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitCost: number;
}

export interface ProductPackagingDTO {
  packagingId: string;
  packagingName: string;
  quantity: number;
  unitCost: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  basePrice: number;
  /** Custo dos ingredientes + embalagens (Módulo P3.1 — antes só ingredientes, Regra 11 do 2.H resolvida aqui). */
  costPrice: number;
  margin: number;
  /** Soma de Recipe.prepTimeMinutes × quantidade, por Recipe vinculada (Módulo P3.1). */
  prepTimeMinutes: number;
  /** (prepTimeMinutes / 60) × StoreConfig.laborCostPerHour (Módulo P3.1). */
  laborCost: number;
  /** prepTimeMinutes × (StoreConfig.fixedCostMonthly / StoreConfig.monthlyProductionMinutes) — rateio proporcional ao tempo de preparo, REGRAS_NEGOCIO.md Seção 9.2 (Módulo P3.1). */
  fixedCostShare: number;
  /** costPrice + laborCost + fixedCostShare (Módulo P3.1). */
  totalCost: number;
  /** totalCost ÷ (1 − StoreConfig.targetMarginPercent/100) — nunca persistido, sempre recalculado (Módulo P3.1). */
  suggestedPrice: number;
  leadTimeDays: number;
  active: boolean;
  featured: boolean;
  recipes: ProductRecipeDTO[];
  packagings: ProductPackagingDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PagedProductsDTO {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Custo e tempo de preparo calculados a partir das Recipes/Packagings vinculadas
 * — `unitCost` de cada Recipe (RecipeDTO.unitCost, `recipeService.getRecipeById`,
 * já resolve conversão de unidade) e `unitCost` de cada Packaging
 * (`packagingService.getPackagingById`). Nunca armazenado — sempre recalculado.
 * Reaproveita os Services (não as Repositories) pelo mesmo motivo já registrado
 * na Sprint 2.J.1 sobre acoplamento Service→Service.
 */
async function calculateProductCosting(
  recipes: { recipeId: string; quantity: number }[],
  packagings: { packagingId: string; quantity: number }[],
): Promise<{
  ingredientCost: number;
  recipeItems: ProductRecipeDTO[];
  packagingCost: number;
  packagingItems: ProductPackagingDTO[];
  prepTimeMinutes: number;
}> {
  let ingredientCost = 0;
  let prepTimeMinutes = 0;
  const recipeItems: ProductRecipeDTO[] = [];

  for (const link of recipes) {
    const recipe = await getRecipeById(link.recipeId);
    ingredientCost += recipe.unitCost * link.quantity;
    prepTimeMinutes += recipe.prepTimeMinutes * link.quantity;
    recipeItems.push({
      recipeId: link.recipeId,
      recipeName: recipe.name,
      quantity: link.quantity,
      unitCost: recipe.unitCost,
    });
  }

  let packagingCost = 0;
  const packagingItems: ProductPackagingDTO[] = [];

  for (const link of packagings) {
    const packaging = await getPackagingById(link.packagingId);
    packagingCost += packaging.unitCost * link.quantity;
    packagingItems.push({
      packagingId: link.packagingId,
      packagingName: packaging.name,
      quantity: link.quantity,
      unitCost: packaging.unitCost,
    });
  }

  return { ingredientCost, recipeItems, packagingCost, packagingItems, prepTimeMinutes };
}

async function mapToDTO(product: ProductWithRelations, storeConfig: StoreConfig): Promise<ProductDTO> {
  const category = await findCategoryById(product.categoryId);
  const basePrice = product.basePrice.toNumber();

  const { ingredientCost, recipeItems, packagingCost, packagingItems, prepTimeMinutes } =
    await calculateProductCosting(
      product.recipes.map((r) => ({ recipeId: r.recipeId, quantity: r.quantity.toNumber() })),
      product.packagings.map((p) => ({ packagingId: p.packagingId, quantity: p.quantity })),
    );

  const costPrice = ingredientCost + packagingCost;
  const margin = basePrice > 0 ? (basePrice - costPrice) / basePrice : 0;

  const laborCost = (prepTimeMinutes / 60) * storeConfig.laborCostPerHour;
  const fixedCostPerMinute =
    storeConfig.monthlyProductionMinutes > 0 ? storeConfig.fixedCostMonthly / storeConfig.monthlyProductionMinutes : 0;
  const fixedCostShare = prepTimeMinutes * fixedCostPerMinute;
  const totalCost = costPrice + laborCost + fixedCostShare;
  const marginFraction = storeConfig.targetMarginPercent / 100;
  const suggestedPrice = marginFraction < 1 ? totalCost / (1 - marginFraction) : totalCost;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    categoryName: category?.name ?? "",
    imageUrl: product.imageUrl,
    basePrice,
    costPrice,
    margin,
    prepTimeMinutes,
    laborCost,
    fixedCostShare,
    totalCost,
    suggestedPrice,
    leadTimeDays: product.leadTimeDays,
    active: product.active,
    featured: product.featured,
    recipes: recipeItems,
    packagings: packagingItems,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

// ─── Validação cruzada de referências ────────────────────────────────────────

async function assertCategoryUsable(categoryId: string): Promise<void> {
  const category = await findCategoryById(categoryId);
  if (!category) throw new InvalidCategoryReferenceError(categoryId);
  if (!category.isActive) throw new InactiveCategoryError(category.name);
}

async function assertRecipesUsable(recipes: ProductRecipeInput[] | undefined): Promise<void> {
  if (!recipes) return;
  for (const link of recipes) {
    try {
      await getRecipeById(link.recipeId);
    } catch {
      throw new InvalidRecipeReferenceError(link.recipeId);
    }
  }
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listProducts(): Promise<ProductDTO[]> {
  const [products, storeConfig] = await Promise.all([findAllProducts(), getStoreConfig()]);
  return Promise.all(products.map((p) => mapToDTO(p, storeConfig)));
}

export async function getProductById(id: string): Promise<ProductDTO> {
  const [product, storeConfig] = await Promise.all([findProductById(id), getStoreConfig()]);
  if (!product) throw new ProductNotFoundError(id);
  return mapToDTO(product, storeConfig);
}

export async function searchProducts(query: string): Promise<ProductDTO[]> {
  const [products, storeConfig] = await Promise.all([searchProductsInRepo(query), getStoreConfig()]);
  return Promise.all(products.map((p) => mapToDTO(p, storeConfig)));
}

export async function listProductsPaged(params: ListProductsParams = {}): Promise<PagedProductsDTO> {
  const [result, storeConfig] = await Promise.all([listProductsPagedInRepo(params), getStoreConfig()]);
  const items = await Promise.all(result.items.map((p) => mapToDTO(p, storeConfig)));
  return { items, total: result.total, page: result.page, pageSize: result.pageSize };
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo: validator (estrutural) → categoria existe e ativa → cada receita existe
// → Repository (criação aninhada Product + ProductRecipe) → map.
// Sem checagem de nome duplicado: REGRAS_NEGOCIO.md não documenta unicidade de
// nome para Product (diferente de ProductCategory, que tem `name @unique`) —
// decisão consciente registrada na Sprint 2.J.1, não uma omissão.

export async function createProduct(input: ProductInput): Promise<ProductDTO> {
  const errors = validateProductCreate(input);
  if (errors.length > 0) throw new ProductValidationFailedError(errors);

  await assertCategoryUsable(input.categoryId);
  await assertRecipesUsable(input.recipes);

  const created = await createProductInRepo({
    name: input.name.trim(),
    description: input.description ?? null,
    categoryId: input.categoryId,
    imageUrl: input.imageUrl ?? null,
    basePrice: input.basePrice,
    leadTimeDays: input.leadTimeDays,
    featured: input.featured,
    recipes: input.recipes?.map((r) => ({ recipeId: r.recipeId, quantity: r.quantity })),
  });

  return mapToDTO(created, await getStoreConfig());
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateProduct(
  id: string,
  input: Partial<Omit<ProductInput, "recipes">> & { recipes?: ProductRecipeInput[] },
): Promise<ProductDTO> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);

  const errors = validateProductUpdate(input);
  if (errors.length > 0) throw new ProductValidationFailedError(errors);

  if (input.categoryId !== undefined) await assertCategoryUsable(input.categoryId);
  await assertRecipesUsable(input.recipes);

  const updated = await updateProductInRepo(id, {
    name: input.name?.trim(),
    description: input.description === undefined ? undefined : input.description,
    categoryId: input.categoryId,
    imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl,
    basePrice: input.basePrice,
    leadTimeDays: input.leadTimeDays,
    featured: input.featured,
    recipes: input.recipes?.map((r) => ({ recipeId: r.recipeId, quantity: r.quantity })),
  });

  return mapToDTO(updated, await getStoreConfig());
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateProduct(id: string): Promise<ProductDTO> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);
  const updated = await activateProductInRepo(id);
  return mapToDTO(updated, await getStoreConfig());
}

export async function deactivateProduct(id: string): Promise<ProductDTO> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);
  const updated = await deactivateProductInRepo(id);
  return mapToDTO(updated, await getStoreConfig());
}

// ─── Exclusão protegida ───────────────────────────────────────────────────────
//
// Mesma lógica de proteção já usada em `productCategoryService.deactivateCategory`
// (CategoryHasProductsError) — aqui aplicada à exclusão de Product, verificando
// uso em OrderItem (`countProductUsage`) em vez de contagem de produtos por categoria.

export async function deleteProduct(id: string): Promise<void> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);

  const usage = await countProductUsage(id);
  if (usage > 0) throw new ProductInUseError(id, usage);

  await deleteProductInRepo(id);
}

export { productExists };
