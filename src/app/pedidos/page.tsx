"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeaderMinimal } from "@/components/layout/Header";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/mock-data";
import { formatDate } from "@/lib/formatters/date";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUserOrders } from "@/hooks/useUserOrders";
import type { CartItem } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const STATUS_CLASS: Record<string, string> = {
  RASCUNHO: "bg-sand text-muted",
  CONFIRMADO: "bg-rose/20 text-chocolate",
  EM_PRODUCAO: "bg-amber-100 text-amber-800",
  PRONTO: "bg-sage/20 text-sage",
  SAIU_ENTREGA: "bg-blue-100 text-blue-800",
  ENTREGUE: "bg-sand text-muted",
  CANCELADO: "bg-red-100 text-red-700",
};

export default function PedidosPage() {
  const { loadFromOrder } = useCart();
  const router = useRouter();
  const customer = useCurrentUser();
  const { orders, isLoading, error } = useUserOrders(customer?.phone ?? null);

  const handleRepeat = (orderId: string, customize = false) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Reconstrói CartItem a partir do snapshot do pedido — sem depender de PRODUCTS mock.
    // Os campos do snapshot (productId, productName, unitPrice) são suficientes para o carrinho.
    // leadTimeDays usa valor conservador de 3; o checkout recalcula a partir dos produtos reais.
    const cartItems: CartItem[] = order.items.map((i) => ({
      productId: i.productId,
      product: {
        id: i.productId,
        name: i.productName,
        description: "",
        categoryId: "",
        categoryName: "",
        imageEmoji: "🎂",
        basePrice: i.unitPrice,
        leadTimeDays: 3,
        occasions: [],
      },
      quantity: i.quantity,
      observation: customize ? i.observation : undefined,
    }));

    loadFromOrder(cartItems);
    router.push(customize ? "/checkout" : "/");
  };

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title="Meus Pedidos" />

      <div className="px-5 py-4">
        {!customer && (
          <div className="py-12 text-center">
            <p className="text-muted mb-4 text-sm">Faça login para ver seus pedidos.</p>
            <Link href="/login?callbackUrl=/pedidos" className="font-semibold text-rose">
              Entrar com meu celular
            </Link>
          </div>
        )}

        {customer && (
          <p className="text-muted mb-4 text-sm">
            Olá, {customer.name}! · {customer.phone}
          </p>
        )}

        {customer && isLoading && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="shadow-card h-32 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {customer && !isLoading && error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar seus pedidos. Tente novamente mais tarde.
          </div>
        )}

        {customer && !isLoading && !error && orders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">Você ainda não tem pedidos.</p>
          </div>
        )}

        {customer && !isLoading && !error && orders.map((order) => (
          <article
            key={order.id}
            className="shadow-card mb-3 rounded-2xl bg-white p-4"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <strong>#{order.orderNumber}</strong>
                <p className="text-muted text-xs">
                  Entrega: {formatDate(order.deliveryDate)}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_CLASS[order.status] ?? "bg-sand"}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>

            <div className="text-sm">
              {order.items.map((item) => (
                <div key={item.productId}>
                  {item.productName} × {item.quantity}
                </div>
              ))}
            </div>

            <p className="mt-2 font-semibold">{formatCurrency(order.total)}</p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-sand py-2.5 text-sm font-semibold"
              >
                Ver detalhes
              </button>
              <button
                type="button"
                onClick={() => handleRepeat(order.id, order.status === "ENTREGUE")}
                className="flex-1 rounded-lg bg-rose py-2.5 text-sm font-semibold text-white"
              >
                {order.status === "ENTREGUE" ? "Pedir e personalizar" : "Pedir novamente"}
              </button>
            </div>
          </article>
        ))}

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-semibold text-rose"
        >
          Fazer novo pedido
        </Link>
      </div>
    </div>
  );
}
