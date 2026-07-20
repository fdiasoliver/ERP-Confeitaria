import type { ValidationError } from "@/lib/types";

const ALLOWED_UNIT_TYPES = ["MASS", "VOLUME", "UNIT"] as const;
const ABBREVIATION_RE = /^[\p{L}0-9.%/]+$/u;

export interface UnitOfMeasureInput {
  name: string;
  abbreviation: string;
  type: string;
  sortOrder?: number;
}

export function validateUnitCreate(input: UnitOfMeasureInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // name — obrigatório, mín 2, máx 100
  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else {
    const name = input.name.trim();
    if (name.length < 2) {
      errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    } else if (name.length > 100) {
      errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
    }
  }

  // abbreviation — obrigatório, tamanho, caracteres permitidos
  if (!input.abbreviation || input.abbreviation.trim() === "") {
    errors.push({ field: "abbreviation", code: "REQUIRED", message: "Símbolo é obrigatório." });
  } else {
    const abbreviation = input.abbreviation.trim();
    if (abbreviation.length > 10) {
      errors.push({ field: "abbreviation", code: "MAX_LENGTH", message: "Símbolo deve ter no máximo 10 caracteres." });
    } else if (!ABBREVIATION_RE.test(abbreviation)) {
      errors.push({ field: "abbreviation", code: "INVALID_FORMAT", message: "Símbolo contém caracteres não permitidos." });
    }
  }

  // type — exclusivamente MASS, VOLUME, UNIT
  if (!input.type || !ALLOWED_UNIT_TYPES.includes(input.type as (typeof ALLOWED_UNIT_TYPES)[number])) {
    errors.push({ field: "type", code: "INVALID_VALUE", message: "Tipo deve ser MASS, VOLUME ou UNIT." });
  }

  // sortOrder — inteiro >= 0 se fornecido
  if (input.sortOrder !== undefined) {
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      errors.push({ field: "sortOrder", code: "INVALID_VALUE", message: "Ordem deve ser um número inteiro maior ou igual a 0." });
    }
  }

  return errors;
}

export function validateUnitUpdate(input: Partial<UnitOfMeasureInput>): ValidationError[] {
  const errors: ValidationError[] = [];

  // name — se fornecido, aplica as mesmas regras de criação
  if (input.name !== undefined) {
    if (input.name.trim() === "") {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome não pode ser vazio." });
    } else {
      const name = input.name.trim();
      if (name.length < 2) {
        errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
      } else if (name.length > 100) {
        errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
      }
    }
  }

  // abbreviation — se fornecido, aplica as mesmas regras de criação
  if (input.abbreviation !== undefined) {
    if (input.abbreviation.trim() === "") {
      errors.push({ field: "abbreviation", code: "REQUIRED", message: "Símbolo não pode ser vazio." });
    } else {
      const abbreviation = input.abbreviation.trim();
      if (abbreviation.length > 10) {
        errors.push({ field: "abbreviation", code: "MAX_LENGTH", message: "Símbolo deve ter no máximo 10 caracteres." });
      } else if (!ABBREVIATION_RE.test(abbreviation)) {
        errors.push({ field: "abbreviation", code: "INVALID_FORMAT", message: "Símbolo contém caracteres não permitidos." });
      }
    }
  }

  // type — se fornecido, exclusivamente MASS, VOLUME, UNIT
  if (input.type !== undefined) {
    if (!ALLOWED_UNIT_TYPES.includes(input.type as (typeof ALLOWED_UNIT_TYPES)[number])) {
      errors.push({ field: "type", code: "INVALID_VALUE", message: "Tipo deve ser MASS, VOLUME ou UNIT." });
    }
  }

  // sortOrder — inteiro >= 0 se fornecido
  if (input.sortOrder !== undefined) {
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      errors.push({ field: "sortOrder", code: "INVALID_VALUE", message: "Ordem deve ser um número inteiro maior ou igual a 0." });
    }
  }

  return errors;
}
