import { prisma } from "@/lib/prisma";
import type { ThemeConfig as PrismaThemeConfig } from "@prisma/client";

export async function findActiveThemeConfig(): Promise<PrismaThemeConfig | null> {
  return prisma.themeConfig.findFirst({ where: { isActive: true } });
}

export async function updateThemeConfigBranding(
  id: string,
  logoUrl: string | null,
  faviconUrl: string | null,
): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.update({
    where: { id },
    data: { logoUrl, faviconUrl },
  });
}

export async function createDefaultThemeConfig(
  logoUrl: string | null,
  faviconUrl: string | null,
): Promise<PrismaThemeConfig> {
  return prisma.themeConfig.create({
    data: { logoUrl, faviconUrl },
  });
}

export async function getThemeBranding(): Promise<{ logoUrl: string | null; faviconUrl: string | null }> {
  const result = await prisma.themeConfig.findFirst({
    where: { isActive: true },
    select: { logoUrl: true, faviconUrl: true },
  });
  return result ?? { logoUrl: null, faviconUrl: null };
}
