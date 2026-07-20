import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, notFound, internalError } from "@/lib/http/responses";
import type { ProductInput } from "@/lib/validators/productValidator";
import type { ListProductsParams } from "@/lib/repositories/productRepository";
import {
  listProductsPaged,
  createProduct,
  ProductValidationFailedError,
  InvalidCategoryReferenceError,
  InactiveCategoryError,
  InvalidRecipeReferenceError,
} from "@/lib/productService";

function parseListParams(searchParams: URLSearchParams): ListProductsParams {
  const params: ListProductsParams = {};

  const page = searchParams.get("page");
  if (page !== null) {
    const parsed = Number(page);
    if (Number.isFinite(parsed)) params.page = parsed;
  }

  const pageSize = searchParams.get("pageSize");
  if (pageSize !== null) {
    const parsed = Number(pageSize);
    if (Number.isFinite(parsed)) params.pageSize = parsed;
  }

  const search = searchParams.get("search");
  if (search !== null && search.trim().length > 0) params.search = search;

  const categoryId = searchParams.get("categoryId");
  if (categoryId !== null && categoryId.trim().length > 0) params.categoryId = categoryId;

  const active = searchParams.get("active");
  if (active !== null) params.active = active === "true";

  const orderBy = searchParams.get("orderBy");
  if (orderBy === "name" || orderBy === "basePrice" || orderBy === "createdAt") params.orderBy = orderBy;

  const orderDirection = searchParams.get("orderDirection");
  if (orderDirection === "asc" || orderDirection === "desc") params.orderDirection = orderDirection;

  return params;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  try {
    const result = await listProductsPaged(parseListParams(searchParams));
    return ok(result);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const product = await createProduct(body as ProductInput);
    return created(product);
  } catch (err) {
    if (err instanceof ProductValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidCategoryReferenceError) return notFound("Categoria não encontrada.");
    if (err instanceof InactiveCategoryError) {
      return conflict("INACTIVE_CATEGORY", err.message, { categoryName: err.categoryName });
    }
    if (err instanceof InvalidRecipeReferenceError) return notFound("Receita não encontrada.");
    return internalError();
  }
}
