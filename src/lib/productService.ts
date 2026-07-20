import type { ValidationError } from "@/lib/types";
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

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  basePrice: number;
  costPrice: number;
  margin: number;
  leadTimeDays: number;
  active: boolean;
  featured: boolean;
  recipes: ProductRecipeDTO[];
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
 * Custo calculado a partir do `unitCost` já computado por cada Recipe vinculada
 * (RecipeDTO.unitCost, `recipeService.getRecipeById`). Nunca armazenado — sempre
 * recalculado, mesmo princípio já usado em `recipeService.calculateCost`. Reaproveita
 * o Service de Receitas (não a Repository) porque o cálculo envolve conversão de
 * unidade não trivial já implementada e testada ali — ver Observação Técnica no
 * relatório da Sprint 2.J.1 sobre acoplamento Service→Service.
 */
async function calculateCostPrice(
  recipes: { recipeId: string; quantity: number }[],
): Promise<{ costPrice: number; items: ProductRecipeDTO[] }> {
  let costPrice = 0;
  const items: ProductRecipeDTO[] = [];

  for (const link of recipes) {
    const recipe = await getRecipeById(link.recipeId);
    costPrice += recipe.unitCost * link.quantity;
    items.push({
      recipeId: link.recipeId,
      recipeName: recipe.name,
      quantity: link.quantity,
      unitCost: recipe.unitCost,
    });
  }

  return { costPrice, items };
}

async function mapToDTO(product: ProductWithRelations): Promise<ProductDTO> {
  const category = await findCategoryById(product.categoryId);
  const basePrice = product.basePrice.toNumber();

  const { costPrice, items } = await calculateCostPrice(
    product.recipes.map((r) => ({ recipeId: r.recipeId, quantity: r.quantity.toNumber() })),
  );

  const margin = basePrice > 0 ? (basePrice - costPrice) / basePrice : 0;

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
    leadTimeDays: product.leadTimeDays,
    active: product.active,
    featured: product.featured,
    recipes: items,
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
  const products = await findAllProducts();
  return Promise.all(products.map(mapToDTO));
}

export async function getProductById(id: string): Promise<ProductDTO> {
  const product = await findProductById(id);
  if (!product) throw new ProductNotFoundError(id);
  return mapToDTO(product);
}

export async function searchProducts(query: string): Promise<ProductDTO[]> {
  const products = await searchProductsInRepo(query);
  return Promise.all(products.map(mapToDTO));
}

export async function listProductsPaged(params: ListProductsParams = {}): Promise<PagedProductsDTO> {
  const result = await listProductsPagedInRepo(params);
  const items = await Promise.all(result.items.map(mapToDTO));
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

  return mapToDTO(created);
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

  return mapToDTO(updated);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateProduct(id: string): Promise<ProductDTO> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);
  const updated = await activateProductInRepo(id);
  return mapToDTO(updated);
}

export async function deactivateProduct(id: string): Promise<ProductDTO> {
  const existing = await findProductById(id);
  if (!existing) throw new ProductNotFoundError(id);
  const updated = await deactivateProductInRepo(id);
  return mapToDTO(updated);
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
