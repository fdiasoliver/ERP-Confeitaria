import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { ok, created, badRequest, invalidBody, conflict, internalError } from "@/lib/http/responses";
import type { SalesChannelInput } from "@/lib/types";
import {
  listSalesChannels,
  createSalesChannel,
  ValidationFailedError,
  SlugConflictError,
  NameConflictError,
} from "@/lib/salesChannelService";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const channels = await listSalesChannels();
    return ok(channels);
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
    const channel = await createSalesChannel(body as SalesChannelInput);
    return created(channel);
  } catch (err) {
    if (err instanceof ValidationFailedError) return badRequest(err.errors);
    if (err instanceof SlugConflictError) {
      return conflict("SLUG_CONFLICT", `Já existe um canal de venda com o slug "${err.slug}".`, { slug: err.slug });
    }
    if (err instanceof NameConflictError) {
      return conflict("NAME_CONFLICT", err.message, { name: err.name });
    }
    return internalError();
  }
}
