import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { OccasionTagInput } from "@/lib/types";
import {
  listAllOccasions,
  createOccasion,
  ValidationFailedError,
  SlugConflictError,
} from "@/lib/occasionTagService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const occasions = await listAllOccasions();
    return ok(occasions);
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
    const occasion = await createOccasion(body as OccasionTagInput);
    return created(occasion);
  } catch (err) {
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    if (err instanceof SlugConflictError) {
      return conflict("SLUG_CONFLICT", `Já existe uma ocasião com o slug "${err.slug}".`, { slug: err.slug });
    }
    return internalError();
  }
}
