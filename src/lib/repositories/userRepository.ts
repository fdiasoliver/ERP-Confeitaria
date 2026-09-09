import { prisma } from "@/lib/prisma";
import type { Prisma, User, UserRole } from "@prisma/client";

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  active?: boolean;
  orderBy?: "name" | "createdAt";
  orderDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function buildWhere(params: Pick<ListUsersParams, "search" | "role" | "active">): Prisma.UserWhereInput {
  return {
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.role ? { role: params.role } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { email: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function countActiveAdmins(excludeId?: string): Promise<number> {
  return prisma.user.count({
    where: { role: "ADMIN", active: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}

export async function listUsersPaged(params: ListUsersParams): Promise<PagedResult<User>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "name";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: UserRole; passwordHash?: string },
): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function activateUser(id: string): Promise<User> {
  return prisma.user.update({ where: { id }, data: { active: true } });
}

export async function deactivateUser(id: string): Promise<User> {
  return prisma.user.update({ where: { id }, data: { active: false } });
}
