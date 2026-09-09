import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { ListUsersParams } from "@/lib/repositories/userRepository";
import type { UserCreateInput } from "@/lib/validators/userValidator";
import { isRole } from "@/lib/userService";
import { listUsers, createUser, UserValidationFailedError, DuplicateEmailError } from "@/lib/userService";

function parseListParams(searchParams: URLSearchParams): ListUsersParams {
  const params: ListUsersParams = {};

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

  const role = searchParams.get("role");
  if (role !== null && isRole(role)) params.role = role;

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
    const result = await listUsers(parseListParams(searchParams));
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
    const user = await createUser(body as UserCreateInput);
    return created(user);
  } catch (err) {
    if (err instanceof UserValidationFailedError) return badRequest(err.errors);
    if (err instanceof DuplicateEmailError) return conflict("DUPLICATE_EMAIL", err.message, { email: err.email });
    return internalError();
  }
}
