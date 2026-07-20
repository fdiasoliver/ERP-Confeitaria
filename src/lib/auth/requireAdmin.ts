import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unauthorized, forbidden } from "@/lib/http/responses";
import type { NextResponse } from "next/server";

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== "admin") return unauthorized();
  if (session.user.role !== "ADMIN") return forbidden();
  return null;
}
