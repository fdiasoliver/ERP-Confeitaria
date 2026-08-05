import { NextRequest } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { ok, created, badRequest, invalidBody, conflict, notFound, internalError } from "@/lib/http/responses";
import type { PackagingInput } from "@/lib/validators/packagingValidator";
import type { ListPackagingsParams } from "@/lib/repositories/packagingRepository";
import {
  listPackagingsPaged,
  createPackaging,
  PackagingValidationFailedError,
  DuplicatePackagingNameError,
  InvalidPackagingCategoryReferenceError,
  InvalidSupplierReferenceError,
} from "@/lib/packagingService";

function parseListParams(searchParams: URLSearchParams): ListPackagingsParams {
  const params: ListPackagingsParams = {};

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
  if (orderBy === "name" || orderBy === "createdAt") params.orderBy = orderBy;

  const orderDirection = searchParams.get("orderDirection");
  if (orderDirection === "asc" || orderDirection === "desc") params.orderDirection = orderDirection;

  return params;
}

export async function GET(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  try {
    const result = await listPackagingsPaged(parseListParams(searchParams));
    return ok(result);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireProductionChain();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const packaging = await createPackaging(body as PackagingInput);
    return created(packaging);
  } catch (err) {
    if (err instanceof PackagingValidationFailedError) return badRequest(err.errors);
    if (err instanceof InvalidPackagingCategoryReferenceError) return notFound("Categoria de embalagem não encontrada.");
    if (err instanceof InvalidSupplierReferenceError) return notFound("Fornecedor não encontrado.");
    if (err instanceof DuplicatePackagingNameError) {
      return conflict("DUPLICATE_NAME", `Já existe uma embalagem com o nome "${err.name}".`, { name: err.name });
    }
    return internalError();
  }
}
