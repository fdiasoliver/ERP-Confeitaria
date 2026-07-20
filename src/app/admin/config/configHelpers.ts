import { maskCNPJ } from "@/lib/formatters/cnpj";
import { maskPhone } from "@/lib/formatters/phone";
import { maskCEP } from "@/lib/formatters/cep";
import type { StoreConfig, StoreConfigInput } from "@/lib/types";

export const EMPTY_INPUT: StoreConfigInput = {
  name: "",
  legalName: null,
  cnpj: null,
  phone: null,
  email: null,
  instagram: null,
  addressStreet: null,
  addressNumber: null,
  addressComplement: null,
  addressNeighborhood: null,
  addressCity: "São Paulo",
  addressState: "SP",
  addressZip: null,
  freeDeliveryRadiusKm: 3,
  pixKeyType: null,
  pixKey: null,
  laborCostPerHour: 35,
  fixedCostMonthly: 0,
  monthlyProductionUnits: 200,
  targetMarginPercent: 50,
  logoUrl: null,
  faviconUrl: null,
};

export function configToInput(c: StoreConfig): StoreConfigInput {
  return {
    name: c.name,
    legalName: c.legalName,
    cnpj: c.cnpj ? maskCNPJ(c.cnpj) : null,
    phone: c.phone ? maskPhone(c.phone) : null,
    email: c.email,
    instagram: c.instagram,
    addressStreet: c.addressStreet,
    addressNumber: c.addressNumber,
    addressComplement: c.addressComplement,
    addressNeighborhood: c.addressNeighborhood,
    addressCity: c.addressCity,
    addressState: c.addressState,
    addressZip: c.addressZip ? maskCEP(c.addressZip) : null,
    freeDeliveryRadiusKm: c.freeDeliveryRadiusKm,
    pixKeyType: c.pixKeyType,
    pixKey: c.pixKey,
    laborCostPerHour: c.laborCostPerHour,
    fixedCostMonthly: c.fixedCostMonthly,
    monthlyProductionUnits: c.monthlyProductionUnits,
    targetMarginPercent: c.targetMarginPercent,
    logoUrl: c.logoUrl,
    faviconUrl: c.faviconUrl,
  };
}
