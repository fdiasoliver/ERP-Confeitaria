import { getProductById } from "@/lib/productService";
import { calculateCMV } from "@/lib/cmvService";
import {
  sumOrderTotals,
  findItemsGroupedByProductInRange,
  groupOrdersByPaymentMethod,
  type RevenueBasis,
} from "@/lib/repositories/orderRepository";

export type { RevenueBasis };

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
  basis: RevenueBasis;
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

// P3.2 — Relatórios financeiros (PLAN.md). CMV sempre considera pedidos
// ENTREGUE (REGRAS_NEGOCIO.md 13.7), independente do `basis` escolhido para
// faturamento — por isso a margem bruta pode não bater exatamente quando
// basis="PAGO" (compara receita por pagamento contra custo por entrega); a UI
// deixa isso explícito, não é um bug.
export async function getFinancialReport(
  startDate: Date,
  endDate: Date,
  basis: RevenueBasis,
): Promise<FinancialReportDTO> {
  const [{ total: revenue, count: orderCount }, groupedItems, paymentGroups, cmvResult] = await Promise.all([
    sumOrderTotals(startDate, endDate, basis),
    findItemsGroupedByProductInRange(startDate, endDate, basis),
    groupOrdersByPaymentMethod(startDate, endDate, basis),
    calculateCMV(startDate, endDate),
  ]);

  const averageTicket = orderCount > 0 ? revenue / orderCount : 0;
  const grossMargin = revenue > 0 ? (revenue - cmvResult.totalCMV) / revenue : 0;

  // Breakdown por categoria: enriquece os itens (agrupados por produto) com
  // nome/custo do produto e agrega por categoria — mesmo padrão de
  // calculateCMV (cmvService.ts), que já resolve produto a produto.
  const categoryMap = new Map<string, { revenue: number; cost: number; quantity: number }>();
  await Promise.all(
    groupedItems.map(async (item) => {
      const product = await getProductById(item.productId);
      const entry = categoryMap.get(product.categoryName) ?? { revenue: 0, cost: 0, quantity: 0 };
      entry.revenue += item.totalPrice;
      entry.cost += product.costPrice * item.quantity;
      entry.quantity += item.quantity;
      categoryMap.set(product.categoryName, entry);
    }),
  );

  const byCategory: CategoryBreakdownDTO[] = Array.from(categoryMap.entries())
    .map(([categoryName, v]) => ({
      categoryName,
      revenue: v.revenue,
      cost: v.cost,
      margin: v.revenue > 0 ? (v.revenue - v.cost) / v.revenue : 0,
      quantity: v.quantity,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const byPaymentMethod: PaymentMethodBreakdownDTO[] = [...paymentGroups].sort((a, b) => b.total - a.total);

  return {
    basis,
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    revenue,
    orderCount,
    averageTicket,
    cmv: cmvResult.totalCMV,
    grossMargin,
    byCategory,
    byPaymentMethod,
  };
}
