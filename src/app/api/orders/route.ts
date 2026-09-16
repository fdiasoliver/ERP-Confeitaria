import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkFreeDeliveryEligibility, DistanceCalculationFailedError } from "@/lib/deliveryService";
import { NEW_CUSTOMER_PLACEHOLDER_NAME } from "@/lib/constants/customer";
import type { DeliveryType, PaymentMethod } from "@/lib/types";

interface CreateOrderBody {
  customerPhone: string;
  deliveryDate: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
  addressId?: string;
  deliveryAddress?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  receiverName?: string;
  receiverPhone?: string;
  orderNotes?: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    observation?: string;
  }[];
}

// Endereço salvo (addressId) inválido ou pertencente a outro cliente — lançado
// dentro da transação (tx) do POST abaixo, mapeado para 422 no catch externo.
class InvalidAddressError extends Error {
  constructor() {
    super("Endereço inválido.");
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Parâmetro phone obrigatório" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { phone } });
    if (!customer) return NextResponse.json([]);

    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: CreateOrderBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { customerPhone, items, deliveryAddress, addressId, ...orderData } = body;

  if (!customerPhone || !items?.length) {
    return NextResponse.json({ error: "customerPhone e items são obrigatórios" }, { status: 400 });
  }

  // Recalcula a distância/elegibilidade de entrega grátis no servidor — nunca confia
  // no que o cliente enviou (Módulo 5.A). Fora da transação: é uma chamada HTTP
  // externa (Google Maps), não deve segurar uma transação de banco aberta.
  let deliveryDistanceKm: number | null = null;
  if (orderData.deliveryType === "ENTREGA_GRATIS" && deliveryAddress) {
    try {
      const eligibility = await checkFreeDeliveryEligibility(deliveryAddress);
      if (!eligibility.isWithinFreeRadius) {
        return NextResponse.json(
          {
            error: `Este endereço está a ${eligibility.distanceKm.toFixed(1)} km, fora do raio de entrega grátis (${eligibility.freeDeliveryRadiusKm} km). Escolha outra forma de entrega.`,
          },
          { status: 422 },
        );
      }
      deliveryDistanceKm = eligibility.distanceKm;
    } catch (err) {
      if (err instanceof DistanceCalculationFailedError) {
        return NextResponse.json({ error: err.message }, { status: 422 });
      }
      throw err;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.upsert({
        where: { phone: customerPhone },
        update: {},
        create: { name: NEW_CUSTOMER_PLACEHOLDER_NAME, phone: customerPhone },
      });

      // Cria um registro real de Address quando há entrega com endereço informado,
      // ou reaproveita um endereço salvo já existente (cadastro complementar do
      // cliente) quando `addressId` é enviado — nunca cria um Address duplicado
      // nesse segundo caso. Esses endereços acumulam no banco e estarão disponíveis
      // quando o módulo de Clientes (P2.4) for implementado — sem necessidade de
      // migração ou retrabalho.
      let resolvedAddressId: string | null = null;
      if (addressId) {
        // Dentro da mesma transação (tx) — checagem de ownership obrigatória: o
        // endereço salvo só pode ser usado pelo próprio dono.
        const address = await tx.address.findUnique({ where: { id: addressId } });
        if (!address || address.customerId !== customer.id) {
          throw new InvalidAddressError();
        }
        resolvedAddressId = address.id;
      } else if (orderData.deliveryType !== "RETIRADA" && deliveryAddress) {
        const addr = await tx.address.create({
          data: { customerId: customer.id, label: "Entrega", ...deliveryAddress },
        });
        resolvedAddressId = addr.id;
      }

      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          status: "CONFIRMADO",
          deliveryType: orderData.deliveryType,
          deliveryDate: new Date(orderData.deliveryDate + "T12:00:00"),
          addressId: resolvedAddressId,
          receiverName: orderData.receiverName ?? customer.name,
          receiverPhone: orderData.receiverPhone ?? null,
          deliveryFee: orderData.deliveryType === "ENTREGA_GRATIS" ? 0 : orderData.deliveryFee,
          deliveryDistanceKm,
          subtotal: orderData.subtotal,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: "PENDENTE",
          orderNotes: orderData.orderNotes ?? null,
          items: {
            create: items.map((i) => ({
              productId: i.productId,
              productName: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
              observation: i.observation ?? null,
            })),
          },
          statusHistory: {
            create: {
              status: "CONFIRMADO",
              notes: "Pedido criado pelo cliente",
            },
          },
        },
        include: { items: true },
      });

      return order;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof InvalidAddressError) {
      return NextResponse.json({ error: "Endereço inválido." }, { status: 422 });
    }
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
