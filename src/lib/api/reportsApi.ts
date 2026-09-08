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
