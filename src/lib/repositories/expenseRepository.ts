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

export type ExpenseWithRelations = Expense & {
  supplier: { id: string; name: string } | null;
  salesChannel: { id: string; name: string } | null;
  productCategory: { id: string; name: string } | null;
};

const withRelations = {
  supplier: { select: { id: true, name: true } },
  salesChannel: { select: { id: true, name: true } },
  productCategory: { select: { id: true, name: true } },
} satisfies Prisma.ExpenseInclude;

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

export async function findExpenseById(id: string): Promise<ExpenseWithRelations | null> {
  return prisma.expense.findUnique({ where: { id }, include: withRelations });
}

export async function listExpensesPaged(params: ListExpensesParams): Promise<PagedResult<ExpenseWithRelations>> {
  const page = params.page && params.page > 0 ? params.page : 1;
  const pageSize = params.pageSize && params.pageSize > 0 ? params.pageSize : 20;
  const where = buildWhere(params);
  const orderByField = params.orderBy ?? "dueDate";
  const orderDirection = params.orderDirection ?? "asc";

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: withRelations,
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
  salesChannelId?: string | null;
  productCategoryId?: string | null;
  notes?: string | null;
}

export async function createExpense(data: ExpenseWriteData): Promise<ExpenseWithRelations> {
  return prisma.expense.create({ data, include: withRelations });
}

export async function updateExpense(id: string, data: Partial<ExpenseWriteData>): Promise<ExpenseWithRelations> {
  return prisma.expense.update({ where: { id }, data, include: withRelations });
}

export async function deleteExpense(id: string): Promise<void> {
  await prisma.expense.delete({ where: { id } });
}

export async function markExpensePaid(id: string, paidDate: Date): Promise<ExpenseWithRelations> {
  return prisma.expense.update({
    where: { id },
    data: { status: "PAGO", paidDate },
    include: withRelations,
  });
}

export async function markExpensePending(id: string): Promise<ExpenseWithRelations> {
  return prisma.expense.update({
    where: { id },
    data: { status: "PENDENTE", paidDate: null },
    include: withRelations,
  });
}

// ─── Centro de Custo (relatório) ───────────────────────────────────────────────

export interface CostCenterBucket {
  label: string; // nome do canal/categoria, ou "Sem canal"/"Sem categoria"
  total: number;
}

export async function sumPaidExpensesBySalesChannel(startDate: Date, endDate: Date): Promise<CostCenterBucket[]> {
  const expenses = await prisma.expense.findMany({
    where: { status: "PAGO", paidDate: { gte: startDate, lte: endDate } },
    select: { amount: true, salesChannel: { select: { name: true } } },
  });

  const bucketMap = new Map<string, number>();
  for (const expense of expenses) {
    const label = expense.salesChannel?.name ?? "Sem canal";
    bucketMap.set(label, (bucketMap.get(label) ?? 0) + Number(expense.amount));
  }

  return Array.from(bucketMap.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}

export async function sumPaidExpensesByProductCategory(startDate: Date, endDate: Date): Promise<CostCenterBucket[]> {
  const expenses = await prisma.expense.findMany({
    where: { status: "PAGO", paidDate: { gte: startDate, lte: endDate } },
    select: { amount: true, productCategory: { select: { name: true } } },
  });

  const bucketMap = new Map<string, number>();
  for (const expense of expenses) {
    const label = expense.productCategory?.name ?? "Sem categoria";
    bucketMap.set(label, (bucketMap.get(label) ?? 0) + Number(expense.amount));
  }

  return Array.from(bucketMap.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}
