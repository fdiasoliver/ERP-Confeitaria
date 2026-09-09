import type { ValidationError } from "@/lib/types";
import type { UserRole } from "@prisma/client";

export const USER_ROLES: UserRole[] = ["ADMIN", "ATENDIMENTO", "PRODUCAO", "FINANCEIRO"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string; // vazio/ausente = não altera a senha
  role?: UserRole;
}

function validateShared(input: Partial<UserCreateInput>, errors: ValidationError[]): void {
  if (input.email !== undefined) {
    if (!EMAIL_RE.test(input.email)) {
      errors.push({ field: "email", code: "INVALID_FORMAT", message: "E-mail inválido." });
    }
  }

  if (input.role !== undefined && !USER_ROLES.includes(input.role)) {
    errors.push({ field: "role", code: "INVALID_VALUE", message: "Papel inválido." });
  }

  if (input.password !== undefined && input.password !== "") {
    if (input.password.length < 8) {
      errors.push({ field: "password", code: "MIN_LENGTH", message: "Senha deve ter pelo menos 8 caracteres." });
    }
  }
}

export function validateUserCreate(input: UserCreateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome é obrigatório." });
  } else if (input.name.trim().length < 2) {
    errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
  } else if (input.name.trim().length > 100) {
    errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
  }

  if (!input.email || input.email.trim() === "") {
    errors.push({ field: "email", code: "REQUIRED", message: "E-mail é obrigatório." });
  }

  if (!input.password || input.password === "") {
    errors.push({ field: "password", code: "REQUIRED", message: "Senha é obrigatória." });
  }

  if (!input.role) {
    errors.push({ field: "role", code: "REQUIRED", message: "Papel é obrigatório." });
  }

  validateShared(input, errors);

  return errors;
}

export function validateUserUpdate(input: UserUpdateInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.name !== undefined) {
    if (input.name.trim() === "") {
      errors.push({ field: "name", code: "REQUIRED", message: "Nome não pode ser vazio." });
    } else if (input.name.trim().length < 2) {
      errors.push({ field: "name", code: "MIN_LENGTH", message: "Nome deve ter pelo menos 2 caracteres." });
    } else if (input.name.trim().length > 100) {
      errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
    }
  }

  if (input.email !== undefined && input.email.trim() === "") {
    errors.push({ field: "email", code: "REQUIRED", message: "E-mail não pode ser vazio." });
  }

  validateShared(input, errors);

  return errors;
}
