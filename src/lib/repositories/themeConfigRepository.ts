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

// ─── Preset de tema (Módulo Tema, 09-10/09/2026) ──────────────────────────────

export async function getActivePresetId(): Promise<string | null> {
  const result = await prisma.themeConfig.findFirst({
    where: { isActive: true },
    select: { activePreset: true },
  });
  return result?.activePreset ?? null;
}

export async function setActivePresetId(presetId: string): Promise<PrismaThemeConfig> {
  const existing = await prisma.themeConfig.findFirst({ where: { isActive: true } });
  if (existing) {
    return prisma.themeConfig.update({ where: { id: existing.id }, data: { activePreset: presetId } });
  }
  return prisma.themeConfig.create({ data: { activePreset: presetId } });
}
