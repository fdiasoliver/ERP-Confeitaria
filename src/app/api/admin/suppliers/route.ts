import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { SupplierInput } from "@/lib/validators/supplierValidator";
import type { ListSuppliersParams } from "@/lib/repositories/supplierRepository";
import {
  listSuppliers,
  createSupplier,
  SupplierValidationFailedError,
  DuplicateCnpjError,
} from "@/lib/supplierService";

function parseListParams(searchParams: URLSearchParams): ListSuppliersParams {
  const params: ListSuppliersParams = {};

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

  const active = searchParams.get("active");
  if (active !== null) params.active = active === "true";

  const orderBy = searchParams.get("orderBy");
  if (orderBy === "name" || orderBy === "createdAt") params.orderBy = orderBy;

  const orderDirection = searchParams.get("orderDirection");
  if (orderDirection === "asc" || orderDirection === "desc") params.orderDirection = orderDirection;

  return params;
}

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  try {
    const result = await listSuppliers(parseListParams(searchParams));
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
    const supplier = await createSupplier(body as SupplierInput);
    return created(supplier);
  } catch (err) {
    if (err instanceof SupplierValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateCnpjError) {
      return conflict("DUPLICATE_CNPJ", err.message, { cnpj: err.cnpj });
    }
    return internalError();
  }
}
