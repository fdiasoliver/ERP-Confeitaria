import { prisma } from "@/lib/prisma";
import type { Prisma, Expense, ExpenseCategory, ExpenseStatus } from "@prisma/client";

export interface ListExpensesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  startDate?: Date;
  endDate?: Date;
  orderBy?: "dueDate" | "createdAt" | "amount";
  orderDirection?: "asc" | "desc";
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ExpenseWithSupplier = Expense & { supplier: { id: string; name: string } | null };

const withSupplier = { supplier: { select: { id: true, name: true } } } satisfies Prisma.ExpenseInclude;

function buildWhere(
  params: Pick<ListExpensesParams, "search" | "status" | "category" | "startDate" | "endDate">,
): Prisma.ExpenseWhereInput {
  return {
    ...(params.status ? { status: params.status } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.search ? { description: { contains: params.search, mode: "insensitive" } } : {}),
    ...(params.startDate || params.endDate
      ? {
          dueDate: {
            ...(params.startDate ? { gte: params.startDate } : {}),
            ...(params.endDate ? { lte: params.endDate } : {}),
          },
        }
      : {}),
  };
}

export async function findExpenseById(id: string): Promise<ExpenseWithSupplier | null> {
  return prisma.expense.findUnique({ where: { id }, include: withSupplier });
}

export async function listExpensesPaged(params: ListExpensesParams): Promise<PagedResult<ExpenseWithSupplier>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "dueDate";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: withSupplier,
      orderBy: { [orderByField]: orderDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export interface ExpenseWriteData {
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate?: Date | null;
  supplierId?: string | null;
  notes?: string | null;
}

export async function createExpense(data: ExpenseWriteData): Promise<ExpenseWithSupplier> {
  return prisma.expense.create({ data, include: withSupplier });
}

export async function updateExpense(id: string, data: Partial<ExpenseWriteData>): Promise<ExpenseWithSupplier> {
  return prisma.expense.update({ where: { id }, data, include: withSupplier });
}

export async function deleteExpense(id: string): Promise<void> {
  await prisma.expense.delete({ where: { id } });
}

export async function markExpensePaid(id: string, paidDate: Date): Promise<ExpenseWithSupplier> {
  return prisma.expense.update({
    where: { id },
    data: { status: "PAGO", paidDate },
    include: withSupplier,
  });
}

export async function markExpensePending(id: string): Promise<ExpenseWithSupplier> {
  return prisma.expense.update({
    where: { id },
    data: { status: "PENDENTE", paidDate: null },
    include: withSupplier,
  });
}
