import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, badRequest, invalidBody, notFound, conflict, internalError } from "@/lib/http/responses";
import type { PackagingCategoryInput } from "@/lib/validators/packagingCategoryValidator";
import {
  updatePackagingCategory,
  deletePackagingCategory,
  PackagingCategoryNotFoundError,
  PackagingCategoryValidationFailedError,
  DuplicatePackagingCategoryNameError,
  PackagingCategoryHasPackagingsError,
} from "@/lib/packagingCategoryService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const category = await updatePackagingCategory(id, body as Partial<PackagingCategoryInput>);
    return ok(category);
  } catch (err) {
    if (err instanceof PackagingCategoryNotFoundError) return notFound("Categoria de embalagem não encontrada.");
    if (err instanceof PackagingCategoryValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicatePackagingCategoryNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma categoria de embalagem com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { id } = await params;

  try {
    await deletePackagingCategory(id);
    return ok({ id });
  } catch (err) {
    if (err instanceof PackagingCategoryNotFoundError) return notFound("Categoria de embalagem não encontrada.");
    if (err instanceof PackagingCategoryHasPackagingsError) {
      return conflict(
        "CATEGORY_HAS_PACKAGINGS",
        `Categoria possui ${err.count} embalagem(ns) vinculada(s) e não pode ser excluída.`,
        { count: err.count },
      );
    }
    return internalError();
  }
}
