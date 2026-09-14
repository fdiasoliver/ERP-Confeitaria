// Espelha src/lib/reportsService.ts (FinancialReportDTO/CategoryBreakdownDTO/
// PaymentMethodBreakdownDTO) — mesmo padrão de orderAdminApi.ts: o cliente
// HTTP declara localmente o tipo de exibição, sem importar o Service.

export type RevenueBasis = "entregue" | "pago";

export interface CategoryBreakdownDTO {
  categoryName: string;
  revenue: number;
  cost: number;
  margin: number;
  quantity: number;
}

export interface PaymentMethodBreakdownDTO {
  paymentMethod: string;
  total: number;
  count: number;
}

export interface FinancialReportDTO {
  basis: "ENTREGUE" | "PAGO";
  startDate: string;
  endDate: string;
  revenue: number;
  orderCount: number;
  averageTicket: number;
  cmv: number;
  grossMargin: number;
  byCategory: CategoryBreakdownDTO[];
  byPaymentMethod: PaymentMethodBreakdownDTO[];
}

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message, json.error.details);
  return json.data;
}

/** `startDate`/`endDate` no formato YYYY-MM-DD, ambos obrigatórios. `basis`
 * default "entregue" (ver src/app/api/admin/reports/financial/route.ts). */
export async function getFinancialReport(
  startDate: string,
  endDate: string,
  basis: RevenueBasis = "entregue",
): Promise<FinancialReportDTO> {
  return request<FinancialReportDTO>(
    `/api/admin/reports/financial?startDate=${startDate}&endDate=${endDate}&basis=${basis}`,
  );
}

export interface CostCenterBucketDTO {
  label: string;
  total: number;
}

export interface CostCenterReportDTO {
  startDate: string;
  endDate: string;
  bySalesChannel: CostCenterBucketDTO[];
  byProductCategory: CostCenterBucketDTO[];
}

/** `startDate`/`endDate` no formato YYYY-MM-DD, ambos obrigatórios. Sem parâmetro
 * de basis — a agregação sempre usa despesas com status PAGO (ver
 * src/app/api/admin/reports/cost-centers/route.ts). */
export async function getCostCenterReport(
  startDate: string,
  endDate: string,
): Promise<CostCenterReportDTO> {
  return request<CostCenterReportDTO>(
    `/api/admin/reports/cost-centers?startDate=${startDate}&endDate=${endDate}`,
  );
}

// ─── Fluxo de Caixa (Sprint 3 — Épico 3) ────────────────────────────────────
// Espelha src/lib/reportsService.ts (CashFlowReportDTO).

export interface CashFlowReportDTO {
  basis: "ENTREGUE" | "PAGO";
  startDate: string;
  endDate: string;
  inflow: number; // entradas — revenue no basis selecionado
  outflow: number; // saídas — todas as despesas pagas no período (todas categorias)
  balance: number; // inflow - outflow
}

/** `startDate`/`endDate` no formato YYYY-MM-DD, ambos obrigatórios. `basis`
 * default "entregue" (ver src/app/api/admin/reports/cash-flow/route.ts). Fluxo
 * de caixa realizado — não há previsão a partir de pedidos confirmados. */
export async function getCashFlowReport(
  startDate: string,
  endDate: string,
  basis: RevenueBasis = "entregue",
): Promise<CashFlowReportDTO> {
  return request<CashFlowReportDTO>(
    `/api/admin/reports/cash-flow?startDate=${startDate}&endDate=${endDate}&basis=${basis}`,
  );
}

// ─── DRE (Sprint 3 — Épico 3) ────────────────────────────────────────────────
// Espelha src/lib/reportsService.ts (DREReportDTO). "Devoluções e
// cancelamentos" não é calculada nesta versão — decisão explícita do Product
// Owner, ver nota na UI (relatorios/page.tsx).

export interface DREReportDTO {
  basis: "ENTREGUE" | "PAGO";
  startDate: string;
  endDate: string;
  netRevenue: number; // Receita líquida
  cmv: number; // (-) CMV — sempre pedidos entregues
  grossProfit: number; // (=) Lucro bruto
  operatingExpenses: number; // (-) Despesas operacionais (category != IMPOSTOS)
  ebitda: number; // (=) EBITDA
  taxes: number; // (-) Impostos (category == IMPOSTOS)
  netProfit: number; // (=) Lucro líquido
}

/** `startDate`/`endDate` no formato YYYY-MM-DD, ambos obrigatórios. `basis`
 * default "entregue" (ver src/app/api/admin/reports/dre/route.ts). */
export async function getDREReport(
  startDate: string,
  endDate: string,
  basis: RevenueBasis = "entregue",
): Promise<DREReportDTO> {
  return request<DREReportDTO>(
    `/api/admin/reports/dre?startDate=${startDate}&endDate=${endDate}&basis=${basis}`,
  );
}

// ─── Contas a Pagar (Sprint 3 — Épico 3) ─────────────────────────────────────
// Espelha src/lib/reportsService.ts (AccountsPayableReportDTO/
// AccountsPayableItemDTO/AccountsPayableCategoryBucketDTO). Sem parâmetro de
// data — dívida em aberto "agora", não um evento de período.

export interface AccountsPayableItemDTO {
  id: string;
  description: string;
  amount: number;
  category: string;
  dueDate: string | null;
  salesChannelId: string | null;
  productCategoryId: string | null;
}

export interface AccountsPayableCategoryBucketDTO {
  category: string;
  total: number;
}

export interface AccountsPayableReportDTO {
  totalPending: number;
  totalOverdue: number;
  byCategory: AccountsPayableCategoryBucketDTO[];
  items: AccountsPayableItemDTO[];
}

/** Sem parâmetros — Contas a Pagar não é filtrado por período (ver
 * src/app/api/admin/reports/accounts-payable/route.ts). */
export async function getAccountsPayableReport(): Promise<AccountsPayableReportDTO> {
  return request<AccountsPayableReportDTO>(`/api/admin/reports/accounts-payable`);
}
