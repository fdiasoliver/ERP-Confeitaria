import type { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";

export async function requireOrderAccess(): Promise<NextResponse | null> {
  return requireRole(["ADMIN", "ATENDIMENTO", "PRODUCAO"]);
}
