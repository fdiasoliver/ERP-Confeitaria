import type { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";

export async function requireAdmin(): Promise<NextResponse | null> {
  return requireRole(["ADMIN"]);
}
