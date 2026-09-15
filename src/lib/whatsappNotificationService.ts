import type { DeliveryType, OrderStatus } from "@/lib/types";
import { formatDate } from "@/lib/formatters/date";
import { sendWhatsAppMessage } from "@/lib/clients/whatsappClient";
import { logWhatsAppMessage } from "@/lib/repositories/whatsappLogRepository";

// Status que disparam notificação ao cliente — decisão do Product Owner,
// Sprint 5.B (REGRAS_NEGOCIO.md 12.6). Templates são texto fixo aprovado
// nesta mesma sprint — qualquer mudança de texto exige nova decisão de produto,
// não é ajuste livre de implementação.
const TEMPLATES: Partial<Record<OrderStatus, string>> = {
  CONFIRMADO: "order_confirmed",
  PRONTO: "order_ready",
  SAIU_ENTREGA: "order_out_for_delivery",
  ENTREGUE: "order_delivered",
};

interface NotifyOrderStatusInput {
  orderId: string;
  phone: string;
  orderNumber: number;
  status: OrderStatus;
  deliveryDate: string;
  deliveryType: DeliveryType;
}

function buildMessage(input: NotifyOrderStatusInput): string | null {
  switch (input.status) {
    case "CONFIRMADO":
      return `Seu pedido #${input.orderNumber} foi confirmado! Entrega prevista para ${formatDate(input.deliveryDate)}. 🎂`;
    case "PRONTO":
      return input.deliveryType === "RETIRADA"
        ? `Seu pedido #${input.orderNumber} está pronto! Pode vir buscar.`
        : `Seu pedido #${input.orderNumber} está pronto! Sairá para entrega em breve.`;
    case "SAIU_ENTREGA":
      return `Seu pedido #${input.orderNumber} saiu para entrega!`;
    case "ENTREGUE":
      return `Pedido #${input.orderNumber} entregue! Esperamos que goste. 💕`;
    default:
      return null;
  }
}

// Best-effort, não-bloqueante: uma falha de envio de WhatsApp nunca deve
// propagar como erro da mutação principal de status do pedido (decisão do
// ai-solution-architect, Sprint 5.B) — sempre registrada em WhatsAppLog,
// nunca lançada.
export async function notifyOrderStatus(input: NotifyOrderStatusInput): Promise<void> {
  const template = TEMPLATES[input.status];
  const message = buildMessage(input);
  if (!template || !message) return;

  try {
    const result = await sendWhatsAppMessage(input.phone, message);
    await logWhatsAppMessage({
      phone: input.phone,
      message,
      template,
      orderId: input.orderId,
      success: result.success,
      error: result.error,
    });
  } catch (err) {
    console.error("[whatsappNotificationService] Falha inesperada:", err);
  }
}

// ─── Reagendamento negociado (Sprint 4/4 — Dashboard Executivo + Calendário) ──
// Fora de TEMPLATES/buildMessage acima: reagendamento não é um OrderStatus,
// é orquestrado por orderService.suggestReschedule. Texto fixo já aprovado
// pelo Product Owner — não alterar sem nova decisão de produto.

interface NotifyRescheduleSuggestedInput {
  orderId: string;
  phone: string;
  orderNumber: number;
  suggestedDate: Date;
}

export async function notifyRescheduleSuggested(input: NotifyRescheduleSuggestedInput): Promise<void> {
  const dateKey = input.suggestedDate.toISOString().slice(0, 10);
  const message = `Olá! Precisamos reagendar seu pedido #${input.orderNumber}. Nova data sugerida: ${formatDate(dateKey)}. Acesse /pedidos para confirmar ou recusar.`;

  try {
    const result = await sendWhatsAppMessage(input.phone, message);
    await logWhatsAppMessage({
      phone: input.phone,
      message,
      template: "order_reschedule_suggested",
      orderId: input.orderId,
      success: result.success,
      error: result.error,
    });
  } catch (err) {
    console.error("[whatsappNotificationService] Falha inesperada:", err);
  }
}
