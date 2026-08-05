import type { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { findItemsGroupedByProduct } from "@/lib/repositories/orderRepository";
import { getProductById } from "@/lib/productService";

// ─── CMV — Custo da Mercadoria Vendida (REGRAS_NEGOCIO.md 13.7) ────────────────
//
// CMV = Σ (costPrice × quantidade) de todos os itens de pedidos ENTREGUE no período.
//
// Limitação já aceita e documentada em REGRAS_NEGOCIO.md 13.7 ("Snapshot de custo
// por pedido: A definir"): esta função usa o costPrice ATUAL dos insumos — via
// `productService.getProductById`, que recalcula custo a partir das receitas
// vinculadas (reaproveitado, nunca recalculado de outro jeito) — não o custo real
// no momento em que o pedido foi produzido/vendido. Não há snapshot histórico de
// custo no schema (`OrderItem` só guarda snapshot de preço de venda, não de custo).

export interface CMVLineDTO {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalCost: number;
}

export interface CMVResultDTO {
  totalCMV: number;
  items: CMVLineDTO[];
}

export async function calculateCMV(startDate: Date, endDate: Date): Promise<CMVResultDTO> {
  const grouped = await findItemsGroupedByProduct(startDate, endDate, "ENTREGUE" as PrismaOrderStatus);

  const items = await Promise.all(
    grouped.map(async ({ productId, quantity }): Promise<CMVLineDTO> => {
      const product = await getProductById(productId);
      return {
        productId,
        productName: product.name,
        quantity,
        costPrice: product.costPrice,
        totalCost: product.costPrice * quantity,
      };
    }),
  );

  const totalCMV = items.reduce((sum, item) => sum + item.totalCost, 0);

  return { totalCMV, items };
}
