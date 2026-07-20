import type { CartItem, DeliveryAddressInput, DeliveryType, Order, PaymentMethod } from "@/lib/types";

export interface CreateOrderInput {
  customerPhone: string;
  items: CartItem[];
  deliveryDate: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
  deliveryAddress?: DeliveryAddressInput;
  receiverName?: string;
  receiverPhone?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
}

interface RawOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  observation?: string;
}

interface RawOrder {
  id: string;
  orderNumber: number;
  status: string;
  deliveryType: string;
  deliveryDate: string | Date;
  receiverName?: string | null;
  items?: RawOrderItem[];
  subtotal: number | string;
  deliveryFee?: number | string | null;
  total: number | string;
  paymentMethod: string;
  paymentStatus?: string | null;
  orderNotes?: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: string; orderNumber: number }> {
  const { items, ...rest } = input;

  const body = {
    ...rest,
    items: items.map((i) => ({
      productId: i.productId,
      productName: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.basePrice,
      totalPrice: i.product.basePrice * i.quantity,
      observation: i.observation,
    })),
  };

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Erro ao criar pedido");
  }

  return res.json() as Promise<{ id: string; orderNumber: number }>;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Erro ao buscar pedidos");

  const raw: RawOrder[] = await res.json();

  return raw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status as Order["status"],
    deliveryType: o.deliveryType as Order["deliveryType"],
    deliveryDate: typeof o.deliveryDate === "string"
      ? o.deliveryDate.slice(0, 10)
      : new Date(o.deliveryDate).toISOString().slice(0, 10),
    receiverName: o.receiverName ?? undefined,
    items: (o.items ?? []).map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
      observation: i.observation,
    })),
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee ?? 0),
    total: Number(o.total),
    paymentMethod: o.paymentMethod as Order["paymentMethod"],
    paymentStatus: o.paymentStatus ? (o.paymentStatus as Order["paymentStatus"]) : undefined,
    orderNotes: o.orderNotes ?? undefined,
  }));
}

export async function updateOrderStatus(
  id: string,
  status: string,
  notes?: string
): Promise<void> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? "Erro ao atualizar status");
  }
}
