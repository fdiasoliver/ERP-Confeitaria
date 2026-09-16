import type { ValidationError } from "@/lib/types";

export interface CustomerNotesInput {
  notes?: string | null;
}

// Este Módulo (2.L) nunca cria nem edita phone/name/email — Customer é criado via
// upsert no checkout (fora deste módulo, ver CLAUDE.md "Autenticação"). Por isso este
// Validator cobre exclusivamente `notes`. Se uma API futura (Sprint 2.L.3) receber
// acidentalmente outros campos no body de updateNotes, a defesa real é a Service
// (Sprint 2.L.2) só extrair `notes` do input antes de chamar este Validator — este
// arquivo não tem como impedir campos que nunca chegam até ele.

export function validateCustomerNotesUpdate(input: CustomerNotesInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 2000) {
    errors.push({ field: "notes", code: "MAX_LENGTH", message: "Observações devem ter no máximo 2000 caracteres." });
  }

  return errors;
}

// ─── Criação — cliente corporativo + consumidor final ─────────────────────────
// `type` é `string` (não o enum Prisma `CustomerType`) — mesmo padrão de
// UnitOfMeasureInput.type em unitValidator.ts: validado aqui contra a lista
// permitida, convertido para o enum Prisma só no Service (cast), Validator nunca
// importa tipo do Prisma.

const ALLOWED_CUSTOMER_TYPES = ["CONSUMIDOR_FINAL", "CORPORATIVO"] as const;

export interface CustomerCreateInput {
  name: string;
  type: string;
  phone?: string | null;
  cnpj?: string | null;
  companyName?: string | null;
  tradeName?: string | null;
  email?: string | null;
  notes?: string | null;
}

export function validateCustomerCreate(input: CustomerCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  }

  if (!input.type || !ALLOWED_CUSTOMER_TYPES.includes(input.type as (typeof ALLOWED_CUSTOMER_TYPES)[number])) {
    errors.push({ field: "type", code: "INVALID_VALUE", message: "Tipo deve ser CONSUMIDOR_FINAL ou CORPORATIVO." });
    // Sem um tipo válido não é possível aplicar as regras condicionais abaixo.
    return errors;
  }

  const phone = input.phone?.trim() || undefined;
  const cnpj = input.cnpj?.trim() || undefined;
  const companyName = input.companyName?.trim() || undefined;
  const tradeName = input.tradeName?.trim() || undefined;

  if (input.type === "CONSUMIDOR_FINAL") {
    if (!phone) {
      errors.push({ field: "phone", code: "REQUIRED", message: "Telefone é obrigatório para consumidor final." });
    }
    if (cnpj) {
      errors.push({ field: "cnpj", code: "NOT_ALLOWED", message: "CNPJ não é permitido para consumidor final." });
    }
    if (companyName) {
      errors.push({ field: "companyName", code: "NOT_ALLOWED", message: "Razão social não é permitida para consumidor final." });
    }
    if (tradeName) {
      errors.push({ field: "tradeName", code: "NOT_ALLOWED", message: "Nome fantasia não é permitido para consumidor final." });
    }
  } else {
    // CORPORATIVO
    if (!phone && !cnpj) {
      errors.push({
        field: "phone",
        code: "REQUIRED",
        message: "Informe ao menos telefone ou CNPJ para cliente corporativo.",
      });
    }
    if (!companyName) {
      errors.push({ field: "companyName", code: "REQUIRED", message: "Razão social é obrigatória para cliente corporativo." });
    }
  }

  if (input.notes !== undefined && input.notes !== null && input.notes.length > 2000) {
    errors.push({ field: "notes", code: "MAX_LENGTH", message: "Observações devem ter no máximo 2000 caracteres." });
  }

  return errors;
}
