import type { ValidationError } from "@/lib/types";

export interface UnitConversionInput {
  fromUnitId: string;
  toUnitId: string;
  factor: number;
  description?: string;
}

// Regras técnicas de integridade do domínio (não citações literais de REGRAS_NEGOCIO.md,
// que documenta o *uso* da conversão, não estas restrições de campo — ver Sprint 2.D.7):
// fator deve ser positivo (um fator ≤ 0 não tem significado físico) e origem ≠ destino
// (uma conversão de uma unidade para ela mesma é vazia). Mesmo padrão já aplicado a
// `sortOrder >= 0` em unitValidator.ts — restrição técnica óbvia, não regra de negócio
// documentada à parte.

export function validateConversionCreate(input: UnitConversionInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.fromUnitId || input.fromUnitId.trim() === "") {
    errors.push({ field: "fromUnitId", code: "REQUIRED", message: "Unidade de origem é obrigatória." });
  }

  if (!input.toUnitId || input.toUnitId.trim() === "") {
    errors.push({ field: "toUnitId", code: "REQUIRED", message: "Unidade de destino é obrigatória." });
  }

  if (
    input.fromUnitId &&
    input.toUnitId &&
    input.fromUnitId.trim() !== "" &&
    input.fromUnitId === input.toUnitId
  ) {
    errors.push({
      field: "toUnitId",
      code: "INVALID_VALUE",
      message: "A unidade de destino deve ser diferente da unidade de origem.",
    });
  }

  if (input.factor === undefined || input.factor === null || Number.isNaN(input.factor)) {
    errors.push({ field: "factor", code: "REQUIRED", message: "Fator de conversão é obrigatório." });
  } else if (input.factor <= 0) {
    errors.push({ field: "factor", code: "INVALID_VALUE", message: "Fator de conversão deve ser maior que zero." });
  }

  if (input.description !== undefined && input.description.length > 200) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 200 caracteres." });
  }

  return errors;
}

export function validateConversionUpdate(input: Partial<UnitConversionInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.fromUnitId !== undefined && input.fromUnitId.trim() === "") {
    errors.push({ field: "fromUnitId", code: "REQUIRED", message: "Unidade de origem não pode ser vazia." });
  }

  if (input.toUnitId !== undefined && input.toUnitId.trim() === "") {
    errors.push({ field: "toUnitId", code: "REQUIRED", message: "Unidade de destino não pode ser vazia." });
  }

  if (
    input.fromUnitId !== undefined &&
    input.toUnitId !== undefined &&
    input.fromUnitId.trim() !== "" &&
    input.fromUnitId === input.toUnitId
  ) {
    errors.push({
      field: "toUnitId",
      code: "INVALID_VALUE",
      message: "A unidade de destino deve ser diferente da unidade de origem.",
    });
  }

  if (input.factor !== undefined) {
    if (input.factor === null || Number.isNaN(input.factor)) {
      errors.push({ field: "factor", code: "REQUIRED", message: "Fator de conversão não pode ser vazio." });
    } else if (input.factor <= 0) {
      errors.push({ field: "factor", code: "INVALID_VALUE", message: "Fator de conversão deve ser maior que zero." });
    }
  }

  if (input.description !== undefined && input.description !== null && input.description.length > 200) {
    errors.push({ field: "description", code: "MAX_LENGTH", message: "Descrição deve ter no máximo 200 caracteres." });
  }

  return errors;
}
