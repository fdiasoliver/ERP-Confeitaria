import type { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";

export async function requireFinance(): Promise<NextResponse | null> {
  return requireRole(["ADMIN", "FINANCEIRO"]);
}
