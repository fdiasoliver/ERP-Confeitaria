import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { unauthorized, forbidden } from "@/lib/http/responses";
import type { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";

export async function requireRole(roles: UserRole[]): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.userType !== "admin") return unauthorized();
  if (!roles.includes(session.user.role as UserRole)) return forbidden();
  return null;
}
