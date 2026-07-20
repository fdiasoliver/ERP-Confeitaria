import type { ProductCategory, ProductCategoryInput, ProductCategoryWithCount, ValidationError } from "@/lib/types";
import { validateProductCategoryCreate, validateProductCategoryUpdate } from "@/lib/validators/productCategory";
import {
  findActiveCategories,
  findAllCategories,
  findAllCategoriesWithCount,
  findCategoryById,
  findCategoryBySlug,
  createCategory,
  updateCategory,
  activateCategory,
  deactivateCategory,
  countProductsByCategory,
} from "@/lib/repositories/productCategoryRepository";
import type { ProductCategory as PrismaProductCategory } from "@prisma/client";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(public id: string) {
    super(`Categoria não encontrada: ${id}`);
  }
}

export class ValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class SlugConflictError extends Error {
  constructor(public slug: string) {
    super(`Slug já em uso: ${slug}`);
  }
}

export class CategoryHasProductsError extends Error {
  constructor(public id: string, public count: number) {
    super(`Categoria possui ${count} produto(s) vinculado(s) e não pode ser desativada.`);
  }
}

export class NameConflictError extends Error {
  constructor(public name: string) {
    super(`Já existe uma categoria com o nome "${name}".`);
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

function mapToProductCategory(raw: PrismaProductCategory): ProductCategory {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    sortOrder: raw.sortOrder,
    color: raw.color,
    icon: raw.icon,
    isActive: raw.isActive,
  };
}

// ─── Geração de slug ──────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove combining diacritical marks after NFD decomposition
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")    // non-alphanumeric sequences → single hyphen
    .replace(/-{2,}/g, "-")          // colapso defensivo de hífens consecutivos
    .replace(/^-+|-+$/g, "");        // remove hífens nas bordas
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function listActiveCategories(): Promise<ProductCategory[]> {
  const rows = await findActiveCategories();
  return rows.map(mapToProductCategory);
}

export async function listAllCategories(): Promise<ProductCategory[]> {
  const rows = await findAllCategories();
  return rows.map(mapToProductCategory);
}

export async function listAllCategoriesWithCount(): Promise<ProductCategoryWithCount[]> {
  const rows = await findAllCategoriesWithCount();
  return rows.map((raw) => ({ ...mapToProductCategory(raw), productCount: raw._count.products }));
}

export async function getCategoryById(id: string): Promise<ProductCategory> {
  const raw = await findCategoryById(id);
  if (!raw) throw new NotFoundError(id);
  return mapToProductCategory(raw);
}

// ─── Criação ──────────────────────────────────────────────────────────────────
//
// Fluxo:
//   name recebido → trim() → validar tamanho → gerar slug → validar unicidade → Repository

export async function createProductCategory(input: ProductCategoryInput): Promise<ProductCategory> {
  const trimmedName = input.name.trim();

  const errors = validateProductCategoryCreate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const slug = slugify(trimmedName);

  const conflict = await findCategoryBySlug(slug);
  if (conflict) throw new SlugConflictError(slug);

  try {
    const raw = await createCategory({
      name: trimmedName,
      slug,
      sortOrder: input.sortOrder,
      color: input.color,
      icon: input.icon,
    });
    return mapToProductCategory(raw);
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") {
      throw new NameConflictError(trimmedName);
    }
    throw err;
  }
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateProductCategory(
  id: string,
  input: Partial<Pick<ProductCategoryInput, "name" | "sortOrder" | "color" | "icon">>,
): Promise<ProductCategory> {
  const existing = await findCategoryById(id);
  if (!existing) throw new NotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;

  const errors = validateProductCategoryUpdate({ ...input, name: trimmedName });
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const raw = await updateCategory(id, {
    name: trimmedName,
    sortOrder: input.sortOrder,
    color: input.color,
    icon: input.icon,
  });

  return mapToProductCategory(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateProductCategory(id: string): Promise<ProductCategory> {
  const existing = await findCategoryById(id);
  if (!existing) throw new NotFoundError(id);
  const raw = await activateCategory(id);
  return mapToProductCategory(raw);
}

export async function deactivateProductCategory(id: string): Promise<ProductCategory> {
  const existing = await findCategoryById(id);
  if (!existing) throw new NotFoundError(id);

  const count = await countProductsByCategory(id);
  if (count > 0) throw new CategoryHasProductsError(id, count);

  const raw = await deactivateCategory(id);
  return mapToProductCategory(raw);
}
