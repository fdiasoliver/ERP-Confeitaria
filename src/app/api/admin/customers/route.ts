import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { ListCustomersParams } from "@/lib/repositories/customerRepository";
import type { CustomerCreateInput } from "@/lib/validators/customerValidator";
import {
  listCustomers,
  createCustomer,
  CustomerValidationFailedError,
  CustomerDuplicatePhoneError,
  CustomerDuplicateCnpjError,
} from "@/lib/customerService";

function parseListParams(searchParams: URLSearchParams): ListCustomersParams {
  const params: ListCustomersParams = {};

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
  if (orderBy === "name" || orderBy === "phone" || orderBy === "createdAt") params.orderBy = orderBy;

  const orderDirection = searchParams.get("orderDirection");
  if (orderDirection === "asc" || orderDirection === "desc") params.orderDirection = orderDirection;

  return params;
}

export async function GET(request: NextRequest) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  try {
    const result = await listCustomers(parseListParams(searchParams));
    return ok(result);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireRole(["ADMIN", "ATENDIMENTO"]);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  try {
    const customer = await createCustomer(body as CustomerCreateInput);
    return created(customer);
  } catch (err) {
    if (err instanceof CustomerValidationFailedError) return badRequest(err.errors);
    if (err instanceof CustomerDuplicatePhoneError) {
      return conflict("CUSTOMER_DUPLICATE_PHONE", err.message, { phone: err.phone });
    }
    if (err instanceof CustomerDuplicateCnpjError) {
      return conflict("CUSTOMER_DUPLICATE_CNPJ", err.message, { cnpj: err.cnpj });
    }
    return internalError();
  }
}
