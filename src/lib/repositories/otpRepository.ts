import { prisma } from "@/lib/prisma";
import type { OtpCode } from "@prisma/client";

export async function createOtpCode(phone: string, code: string, expiresAt: Date): Promise<OtpCode> {
  return prisma.otpCode.create({ data: { phone, code, expiresAt } });
}

export async function findLatestOtpCode(phone: string): Promise<OtpCode | null> {
  return prisma.otpCode.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });
}

export async function incrementAttempts(id: string): Promise<OtpCode> {
  return prisma.otpCode.update({
    where: { id },
    data: { attempts: { increment: 1 } },
  });
}

export async function markOtpCodeUsed(id: string): Promise<OtpCode> {
  return prisma.otpCode.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
