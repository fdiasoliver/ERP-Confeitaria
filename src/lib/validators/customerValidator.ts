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
