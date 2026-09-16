import type { Address, Customer } from "@prisma/client";
import type { ValidationError } from "@/lib/types";
import { NEW_CUSTOMER_PLACEHOLDER_NAME } from "@/lib/constants/customer";
import {
  findCustomerByPhone,
  updateCustomerProfile as dbUpdateCustomerProfile,
} from "@/lib/repositories/customerRepository";
import {
  findAddressesByCustomerId,
  createAddress as dbCreateAddress,
} from "@/lib/repositories/addressRepository";
import {
  validateCustomerProfileUpdate,
  type CustomerProfileUpdateInput,
} from "@/lib/validators/customerProfileValidator";
import {
  validateAddressCreate,
  resolveAddressDefaults,
  type AddressCreateInput,
} from "@/lib/validators/addressValidator";

// Service do PRÓPRIO cliente editando os PRÓPRIOS dados (cadastro complementar:
// Nome/Endereço/Data de nascimento) — domínio de autorização diferente de
// src/lib/customerService.ts (ADMIN editando Customer de terceiros). Não
// reaproveita nenhuma função/tipo de customerService.ts por decisão do arquiteto.

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class CustomerNotFoundError extends Error {
  constructor(public phone: string) {
    super(`Cliente não encontrado para o telefone: ${phone}`);
  }
}

export class ProfileValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class AddressValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────

export interface CustomerProfileDTO {
  id: string;
  name: string;
  phone: string;
  birthDate: string | null;
  isProfileComplete: boolean;
}

function mapCustomerProfileDTO(
  customer: Pick<Customer, "id" | "name" | "phone" | "birthDate">,
): CustomerProfileDTO {
  return {
    id: customer.id,
    name: customer.name,
    // `phone` é `String?` no schema desde a Sprint de cliente corporativo (Customer
    // pode não ter telefone) — mas este Service é exclusivo do fluxo de
    // autoatendimento do cliente final, sempre autenticado via OTP por telefone
    // (requireCustomer.ts) e sempre encontrado aqui via findCustomerByPhone(phone),
    // então nunca é null na prática deste fluxo.
    phone: customer.phone ?? "",
    birthDate: customer.birthDate ? customer.birthDate.toISOString().slice(0, 10) : null,
    isProfileComplete: customer.name !== NEW_CUSTOMER_PLACEHOLDER_NAME,
  };
}

// Mesmo shape de AddressDTO já usado em customerService.ts — função local
// equivalente, sem importar daquele arquivo (domínio de autorização diferente).
export interface AddressDTO {
  id: string;
  label: string | null;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

function mapAddressDTO(address: Address): AddressDTO {
  return {
    id: address.id,
    label: address.label,
    street: address.street,
    number: address.number,
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
  };
}

// ─── Operações — perfil ────────────────────────────────────────────────────────

export async function getMyProfile(phone: string): Promise<CustomerProfileDTO> {
  const customer = await findCustomerByPhone(phone);
  if (!customer) throw new CustomerNotFoundError(phone);
  return mapCustomerProfileDTO(customer);
}

export async function updateMyProfile(
  phone: string,
  input: CustomerProfileUpdateInput,
): Promise<CustomerProfileDTO> {
  const errors = validateCustomerProfileUpdate(input);
  if (errors.length > 0) throw new ProfileValidationFailedError(errors);

  const existing = await findCustomerByPhone(phone);
  if (!existing) throw new CustomerNotFoundError(phone);

  const updated = await dbUpdateCustomerProfile(existing.id, {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.birthDate !== undefined && {
      birthDate: input.birthDate === null ? null : new Date(input.birthDate),
    }),
  });

  return mapCustomerProfileDTO(updated);
}

// ─── Operações — endereços ─────────────────────────────────────────────────────

export async function listMyAddresses(phone: string): Promise<AddressDTO[]> {
  const customer = await findCustomerByPhone(phone);
  if (!customer) throw new CustomerNotFoundError(phone);

  const addresses = await findAddressesByCustomerId(customer.id);
  return addresses.map(mapAddressDTO);
}

export async function createMyAddress(phone: string, input: AddressCreateInput): Promise<AddressDTO> {
  const errors = validateAddressCreate(input);
  if (errors.length > 0) throw new AddressValidationFailedError(errors);

  const customer = await findCustomerByPhone(phone);
  if (!customer) throw new CustomerNotFoundError(phone);

  const { city, state } = resolveAddressDefaults(input);

  const created = await dbCreateAddress(customer.id, {
    label: input.label ?? null,
    street: input.street,
    number: input.number,
    complement: input.complement ?? null,
    neighborhood: input.neighborhood,
    city,
    state,
    zipCode: input.zipCode,
  });

  return mapAddressDTO(created);
}
