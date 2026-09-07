import { getStoreConfig } from "@/lib/storeConfigService";
import { computeDeliveryDistanceKm } from "@/lib/clients/googleMapsClient";
import type { DeliveryAddressInput } from "@/lib/types";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class DistanceCalculationFailedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// ─── Elegibilidade de entrega grátis (Módulo 5.A) ─────────────────────────────

export interface DeliveryEligibility {
  distanceKm: number;
  isWithinFreeRadius: boolean;
  freeDeliveryRadiusKm: number;
}

interface AddressParts {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string | null;
}

function buildAddressString(parts: AddressParts): string {
  return [`${parts.street}, ${parts.number}`, parts.complement, parts.neighborhood, parts.city, parts.state, parts.zipCode]
    .filter((part): part is string => Boolean(part && part.trim() !== ""))
    .join(", ");
}

/**
 * Calcula a distância real (Google Maps) entre o endereço da loja
 * (`StoreConfig`) e o endereço de entrega informado, e decide se está dentro
 * do raio de entrega grátis (`StoreConfig.freeDeliveryRadiusKm`).
 */
export async function checkFreeDeliveryEligibility(
  destination: DeliveryAddressInput,
): Promise<DeliveryEligibility> {
  const storeConfig = await getStoreConfig();

  if (!storeConfig.addressStreet || !storeConfig.addressNumber || !storeConfig.addressNeighborhood || !storeConfig.addressCity || !storeConfig.addressState) {
    throw new DistanceCalculationFailedError("Endereço da loja não está totalmente cadastrado em Configurações — não é possível calcular a distância.");
  }

  const originAddress = buildAddressString({
    street: storeConfig.addressStreet,
    number: storeConfig.addressNumber,
    complement: storeConfig.addressComplement,
    neighborhood: storeConfig.addressNeighborhood,
    city: storeConfig.addressCity,
    state: storeConfig.addressState,
    zipCode: storeConfig.addressZip,
  });

  const destinationAddress = buildAddressString({
    street: destination.street,
    number: destination.number,
    complement: destination.complement,
    neighborhood: destination.neighborhood,
    city: destination.city,
    state: destination.state,
    zipCode: destination.zipCode,
  });

  const result = await computeDeliveryDistanceKm(originAddress, destinationAddress);
  if (!result.success) {
    throw new DistanceCalculationFailedError(result.error);
  }

  return {
    distanceKm: result.distanceKm,
    isWithinFreeRadius: result.distanceKm <= storeConfig.freeDeliveryRadiusKm,
    freeDeliveryRadiusKm: storeConfig.freeDeliveryRadiusKm,
  };
}
