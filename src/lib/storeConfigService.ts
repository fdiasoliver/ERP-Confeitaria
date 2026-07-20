import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { StoreConfig, StoreConfigInput, ValidationError } from "@/lib/types";
import { validateStoreConfig } from "@/lib/validators/storeConfig";
import {
  findStoreConfig,
  updateStoreConfig,
  createStoreConfig,
} from "@/lib/repositories/storeConfigRepository";
import {
  getThemeBranding,
  updateThemeConfigBranding,
  findActiveThemeConfig,
  createDefaultThemeConfig,
} from "@/lib/repositories/themeConfigRepository";
import type { StoreConfig as PrismaStoreConfig } from "@prisma/client";

class AuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403,
  ) {
    super(message);
  }
}

class ValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

function mapToStoreConfig(
  raw: PrismaStoreConfig,
  logoUrl: string | null,
  faviconUrl: string | null,
): StoreConfig {
  return {
    id: raw.id,
    name: raw.name,
    legalName: raw.legalName,
    cnpj: raw.cnpj,
    phone: raw.phone,
    email: raw.email,
    instagram: raw.instagram,
    addressStreet: raw.addressStreet,
    addressNumber: raw.addressNumber,
    addressComplement: raw.addressComplement,
    addressNeighborhood: raw.addressNeighborhood,
    addressCity: raw.addressCity,
    addressState: raw.addressState,
    addressZip: raw.addressZip,
    ibgeCode: raw.ibgeCode,
    latitude: raw.latitude,
    longitude: raw.longitude,
    freeDeliveryRadiusKm: raw.freeDeliveryRadiusKm,
    pixKeyType: raw.pixKeyType as StoreConfig["pixKeyType"],
    pixKey: raw.pixKey,
    laborCostPerHour: Number(raw.laborCostPerHour),
    fixedCostMonthly: Number(raw.fixedCostMonthly),
    monthlyProductionUnits: raw.monthlyProductionUnits,
    targetMarginPercent: Number(raw.targetMarginPercent),
    logoUrl,
    faviconUrl,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

export async function getStoreConfig(): Promise<StoreConfig> {
  const [raw, branding] = await Promise.all([
    findStoreConfig(),
    getThemeBranding(),
  ]);

  if (!raw) throw new Error("Configuração não encontrada.");

  return mapToStoreConfig(raw, branding.logoUrl, branding.faviconUrl);
}

export async function upsertStoreConfig(input: StoreConfigInput): Promise<StoreConfig> {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.userType !== "admin") {
    throw new AuthError("Não autenticado.", 401);
  }
  if (session.user.role !== "ADMIN") {
    throw new AuthError("Acesso negado. Papel ADMIN necessário.", 403);
  }

  const errors = validateStoreConfig(input);
  if (errors.length > 0) throw new ValidationFailedError(errors);

  const { logoUrl, faviconUrl, ...storeFields } = input;

  // Persist StoreConfig
  const existing = await findStoreConfig();
  let updated: PrismaStoreConfig;

  if (existing) {
    updated = await updateStoreConfig(existing.id, {
      name: storeFields.name,
      legalName: storeFields.legalName,
      cnpj: storeFields.cnpj ? storeFields.cnpj.replace(/\D/g, "") : null,
      phone: storeFields.phone ? storeFields.phone.replace(/\D/g, "") : null,
      email: storeFields.email || null,
      instagram: storeFields.instagram || null,
      addressStreet: storeFields.addressStreet,
      addressNumber: storeFields.addressNumber,
      addressComplement: storeFields.addressComplement,
      addressNeighborhood: storeFields.addressNeighborhood,
      addressCity: storeFields.addressCity,
      addressState: storeFields.addressState,
      addressZip: storeFields.addressZip ? storeFields.addressZip.replace(/\D/g, "") : null,
      freeDeliveryRadiusKm: storeFields.freeDeliveryRadiusKm,
      pixKeyType: storeFields.pixKeyType,
      pixKey: storeFields.pixKey || null,
      laborCostPerHour: storeFields.laborCostPerHour,
      fixedCostMonthly: storeFields.fixedCostMonthly,
      monthlyProductionUnits: storeFields.monthlyProductionUnits,
      targetMarginPercent: storeFields.targetMarginPercent,
    });
  } else {
    updated = await createStoreConfig({
      name: storeFields.name,
      legalName: storeFields.legalName,
      cnpj: storeFields.cnpj ? storeFields.cnpj.replace(/\D/g, "") : null,
      phone: storeFields.phone ? storeFields.phone.replace(/\D/g, "") : null,
      email: storeFields.email || null,
      instagram: storeFields.instagram || null,
      addressStreet: storeFields.addressStreet,
      addressNumber: storeFields.addressNumber,
      addressComplement: storeFields.addressComplement,
      addressNeighborhood: storeFields.addressNeighborhood,
      addressCity: storeFields.addressCity,
      addressState: storeFields.addressState,
      addressZip: storeFields.addressZip ? storeFields.addressZip.replace(/\D/g, "") : null,
      freeDeliveryRadiusKm: storeFields.freeDeliveryRadiusKm,
      pixKeyType: storeFields.pixKeyType,
      pixKey: storeFields.pixKey || null,
      laborCostPerHour: storeFields.laborCostPerHour,
      fixedCostMonthly: storeFields.fixedCostMonthly,
      monthlyProductionUnits: storeFields.monthlyProductionUnits,
      targetMarginPercent: storeFields.targetMarginPercent,
    });
  }

  // Persist ThemeConfig branding
  const theme = await findActiveThemeConfig();
  if (theme) {
    await updateThemeConfigBranding(theme.id, logoUrl, faviconUrl);
  } else {
    await createDefaultThemeConfig(logoUrl, faviconUrl);
  }

  return mapToStoreConfig(updated, logoUrl, faviconUrl);
}

export { AuthError, ValidationFailedError };
