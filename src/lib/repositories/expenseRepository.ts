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

// ─── Fluxo de Caixa / DRE / Contas a Pagar (relatório) ─────────────────────────

/**
 * Soma todas as despesas pagas no período, todas as categorias (inclusive
 * Impostos) — saídas de caixa real para o relatório de Fluxo de Caixa.
 */
export async function sumPaidExpensesByPeriod(startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { status: "PAGO", paidDate: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

export interface PaidExpensesTaxSplit {
  operatingExpenses: number; // category !== IMPOSTOS
  taxes: number; // category === IMPOSTOS
}

/**
 * Mesmo universo de sumPaidExpensesByPeriod (despesas pagas no período), mas
 * separado em Despesas Operacionais x Impostos num único groupBy — usado pelo
 * DRE, que precisa das duas linhas separadas.
 */
export async function sumPaidExpensesByPeriodSplitByTax(startDate: Date, endDate: Date): Promise<PaidExpensesTaxSplit> {
  const grouped = await prisma.expense.groupBy({
    by: ["category"],
    where: { status: "PAGO", paidDate: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });

  let operatingExpenses = 0;
  let taxes = 0;
  for (const bucket of grouped) {
    const amount = Number(bucket._sum.amount ?? 0);
    if (bucket.category === "IMPOSTOS") {
      taxes += amount;
    } else {
      operatingExpenses += amount;
    }
  }

  return { operatingExpenses, taxes };
}

export interface AccountsPayableCategoryBucket {
  category: ExpenseCategory;
  total: number;
}

export interface AccountsPayableItem {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  dueDate: Date | null;
  salesChannelId: string | null;
  productCategoryId: string | null;
}

export interface AccountsPayableSummary {
  totalPending: number;
  totalOverdue: number;
  byCategory: AccountsPayableCategoryBucket[];
  items: AccountsPayableItem[];
}

/**
 * Contas a Pagar — sempre "hoje", sem filtro de período: dívida em aberto
 * agora (status = PENDENTE), não um evento de um intervalo de datas.
 */
export async function getAccountsPayableSummary(): Promise<AccountsPayableSummary> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [pending, grouped] = await Promise.all([
    prisma.expense.findMany({
      where: { status: "PENDENTE" },
      select: {
        id: true,
        description: true,
        amount: true,
        category: true,
        dueDate: true,
        salesChannelId: true,
        productCategoryId: true,
      },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { status: "PENDENTE" },
      _sum: { amount: true },
    }),
  ]);

  const totalPending = pending.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalOverdue = pending
    .filter((expense) => expense.dueDate !== null && expense.dueDate < startOfToday)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const byCategory: AccountsPayableCategoryBucket[] = grouped
    .map((bucket) => ({ category: bucket.category, total: Number(bucket._sum.amount ?? 0) }))
    .sort((a, b) => b.total - a.total);

  // Despesas sem dueDate vão para o fim da lista — tratado explicitamente,
  // não deixado para a ordenação padrão do Prisma decidir a posição do null.
  const items: AccountsPayableItem[] = [...pending]
    .sort((a, b) => {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.getTime() - b.dueDate.getTime();
    })
    .map((expense) => ({
      id: expense.id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      dueDate: expense.dueDate,
      salesChannelId: expense.salesChannelId,
      productCategoryId: expense.productCategoryId,
    }));

  return { totalPending, totalOverdue, byCategory, items };
}
