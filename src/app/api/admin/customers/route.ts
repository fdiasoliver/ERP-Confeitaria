import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import { ok, internalError } from "@/lib/http/responses";
import type { ListCustomersParams } from "@/lib/repositories/customerRepository";
import { listCustomers } from "@/lib/customerService";

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
