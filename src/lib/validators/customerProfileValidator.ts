import type { ValidationError } from "@/lib/types";

// Validator do cadastro complementar do PRÓPRIO cliente (Nome/Data de nascimento)
// — diferente de customerValidator.ts (validateCustomerNotesUpdate), que cobre o
// campo `notes` editado pelo ADMIN sobre um Customer de terceiros.

export interface CustomerProfileUpdateInput {
  name?: string;
  birthDate?: string | null;
}

export function validateCustomerProfileUpdate(input: CustomerProfileUpdateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
    }
  }

  if (input.birthDate !== undefined && input.birthDate !== null) {
    const parsed = new Date(input.birthDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.push({ field: "birthDate", code: "INVALID_DATE", message: "Data de nascimento inválida." });
    } else if (parsed.getTime() > Date.now()) {
      errors.push({
        field: "birthDate",
        code: "FUTURE_DATE",
        message: "Data de nascimento não pode ser no futuro.",
      });
    }
  }

  return errors;
}
