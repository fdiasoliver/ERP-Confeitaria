import type { ValidationError } from "@/lib/types";

// Primeiro Validator de Address do projeto — src/app/api/orders/route.ts nunca
// validou formato de endereço (KI-09, ver comentário em checkout/page.tsx).
// Mesmo conjunto de campos obrigatórios já exigido pelo formulário de checkout:
// street, number, neighborhood, zipCode. city/state são opcionais com o mesmo
// default já usado no resto do projeto ("São Paulo"/"SP").

export interface AddressCreateInput {
  label?: string | null;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city?: string;
  state?: string;
  zipCode: string;
}

const DEFAULT_CITY = "São Paulo";
const DEFAULT_STATE = "SP";

export function validateAddressCreate(input: AddressCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.street || input.street.trim().length === 0) {
    errors.push({ field: "street", code: "REQUIRED", message: "Rua é obrigatória." });
  }

  if (!input.number || input.number.trim().length === 0) {
    errors.push({ field: "number", code: "REQUIRED", message: "Número é obrigatório." });
  }

  if (!input.neighborhood || input.neighborhood.trim().length === 0) {
    errors.push({ field: "neighborhood", code: "REQUIRED", message: "Bairro é obrigatório." });
  }

  if (!input.zipCode || input.zipCode.trim().length === 0) {
    errors.push({ field: "zipCode", code: "REQUIRED", message: "CEP é obrigatório." });
  }

  return errors;
}

export function resolveAddressDefaults(input: AddressCreateInput): {
  city: string;
  state: string;
} {
  return {
    city: input.city && input.city.trim().length > 0 ? input.city : DEFAULT_CITY,
    state: input.state && input.state.trim().length > 0 ? input.state : DEFAULT_STATE,
  };
}
