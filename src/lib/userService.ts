import bcrypt from "bcryptjs";
import type { User as PrismaUser, UserRole } from "@prisma/client";
import type { ValidationError } from "@/lib/types";
import {
  validateUserCreate,
  validateUserUpdate,
  type UserCreateInput,
  type UserUpdateInput,
} from "@/lib/validators/userValidator";
import {
  findUserById,
  findUserByEmail,
  countActiveAdmins,
  listUsersPaged,
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  activateUser as dbActivateUser,
  deactivateUser as dbDeactivateUser,
  type ListUsersParams,
  type PagedResult,
} from "@/lib/repositories/userRepository";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class UserNotFoundError extends Error {
  constructor(public id: string) {
    super(`Usuário não encontrado: ${id}`);
  }
}

export class UserValidationFailedError extends Error {
  constructor(public errors: ValidationError[]) {
    super("Dados inválidos.");
  }
}

export class DuplicateEmailError extends Error {
  constructor(public email: string) {
    super(`Já existe um usuário com o e-mail "${email}".`);
  }
}

// Protege contra ficar sem nenhum ADMIN ativo no sistema — sem isso, ninguém
// consegue mais acessar /admin/usuarios para reverter o próprio erro.
export class LastActiveAdminError extends Error {
  constructor() {
    super("Não é possível desativar o último administrador ativo do sistema.");
  }
}

// Protege contra o admin logado desativar a própria conta sem querer, ficando
// bloqueado no meio da ação.
export class SelfDeactivationError extends Error {
  constructor() {
    super("Você não pode desativar sua própria conta.");
  }
}

// ─── Mapeamento Prisma → domínio ──────────────────────────────────────────────
// `passwordHash` nunca sai daqui — UserDTO é o único formato exposto pela API.

export type UserDTO = Omit<PrismaUser, "passwordHash" | "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

function mapToUser(raw: PrismaUser): UserDTO {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    active: raw.active,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

// ─── Operações de leitura ─────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<UserDTO> {
  const raw = await findUserById(id);
  if (!raw) throw new UserNotFoundError(id);
  return mapToUser(raw);
}

export async function listUsers(params: ListUsersParams): Promise<PagedResult<UserDTO>> {
  const result = await listUsersPaged(params);
  return { ...result, items: result.items.map(mapToUser) };
}

// ─── Criação ──────────────────────────────────────────────────────────────────

export async function createUser(input: UserCreateInput): Promise<UserDTO> {
  const trimmedName = input.name.trim();
  const trimmedEmail = input.email.trim().toLowerCase();

  const errors = validateUserCreate({ ...input, name: trimmedName, email: trimmedEmail });
  if (errors.length > 0) throw new UserValidationFailedError(errors);

  const existing = await findUserByEmail(trimmedEmail);
  if (existing) throw new DuplicateEmailError(trimmedEmail);

  const passwordHash = await bcrypt.hash(input.password, 10);

  const raw = await dbCreateUser({ name: trimmedName, email: trimmedEmail, passwordHash, role: input.role });
  return mapToUser(raw);
}

// ─── Atualização ──────────────────────────────────────────────────────────────

export async function updateUser(id: string, input: UserUpdateInput): Promise<UserDTO> {
  const existing = await findUserById(id);
  if (!existing) throw new UserNotFoundError(id);

  const trimmedName = input.name !== undefined ? input.name.trim() : undefined;
  const trimmedEmail = input.email !== undefined ? input.email.trim().toLowerCase() : undefined;

  const errors = validateUserUpdate({ ...input, name: trimmedName, email: trimmedEmail });
  if (errors.length > 0) throw new UserValidationFailedError(errors);

  if (trimmedEmail !== undefined && trimmedEmail !== existing.email) {
    const conflict = await findUserByEmail(trimmedEmail);
    if (conflict && conflict.id !== id) throw new DuplicateEmailError(trimmedEmail);
  }

  const passwordHash = input.password && input.password !== "" ? await bcrypt.hash(input.password, 10) : undefined;

  const raw = await dbUpdateUser(id, { name: trimmedName, email: trimmedEmail, role: input.role, passwordHash });
  return mapToUser(raw);
}

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

export async function activateUser(id: string): Promise<UserDTO> {
  const existing = await findUserById(id);
  if (!existing) throw new UserNotFoundError(id);
  const raw = await dbActivateUser(id);
  return mapToUser(raw);
}

export async function deactivateUser(id: string, currentUserId: string): Promise<UserDTO> {
  const existing = await findUserById(id);
  if (!existing) throw new UserNotFoundError(id);

  if (id === currentUserId) throw new SelfDeactivationError();

  if (existing.role === "ADMIN" && existing.active) {
    const remainingAdmins = await countActiveAdmins(id);
    if (remainingAdmins === 0) throw new LastActiveAdminError();
  }

  const raw = await dbDeactivateUser(id);
  return mapToUser(raw);
}

export function isRole(value: string): value is UserRole {
  return value === "ADMIN" || value === "ATENDIMENTO" || value === "PRODUCAO" || value === "FINANCEIRO";
}
