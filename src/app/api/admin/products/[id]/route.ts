import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { ProductInput, ProductRecipeInput } from "@/lib/validators/productValidator";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  ProductNotFoundError,
  ProductValidationFailedError,
  InvalidCategoryReferenceError,
  InactiveCategoryError,
  InvalidRecipeReferenceError,
  ProductInUseError,
} from "@/lib/productService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    const product = await getProductById(id);
    return ok(product);
  } catch (err) {
    if (err instanceof ProductNotFoundError) return notFound("Produto não encontrado.");
    return internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const product = await updateProduct(
      id,
      body as Partial<Omit<ProductInput, "recipes">> & { recipes?: ProductRecipeInput[] },
    );
    return ok(product);
  } catch (err) {
    if (err instanceof ProductNotFoundError) return notFound("Produto não encontrado.");
    if (err instanceof ProductValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidCategoryReferenceError) return notFound("Categoria não encontrada.");
    if (err instanceof InactiveCategoryError) {
      return conflict("INACTIVE_CATEGORY", err.message, { categoryName: err.categoryName });
    }
    if (err instanceof InvalidRecipeReferenceError) return notFound("Receita não encontrada.");
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deleteProduct(id);
    return ok({ id });
  } catch (err) {
    if (err instanceof ProductNotFoundError) return notFound("Produto não encontrado.");
    if (err instanceof ProductInUseError) {
      return conflict("PRODUCT_IN_USE", err.message, { usageCount: err.usageCount });
    }
    return internalError();
  }
}
