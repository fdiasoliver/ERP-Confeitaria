import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DeliveryType, PaymentMethod } from "@/lib/types";

interface CreateOrderBody {
  customerPhone: string;
  deliveryDate: string;
  deliveryType: DeliveryType;
  deliveryFee: number;
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

  const { customerPhone, items, deliveryAddress, ...orderData } = body;

  if (!customerPhone || !items?.length) {
    return NextResponse.json({ error: "customerPhone e items são obrigatórios" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const customer = await tx.customer.upsert({
        where: { phone: customerPhone },
        update: {},
        create: { name: "Cliente", phone: customerPhone },
      });

      // Cria um registro real de Address quando há entrega com endereço informado.
      // Esses endereços acumulam no banco e estarão disponíveis quando o módulo de
      // Clientes (P2.4) for implementado — sem necessidade de migração ou retrabalho.
      let resolvedAddressId: string | null = null;
      if (orderData.deliveryType !== "RETIRADA" && deliveryAddress) {
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
          deliveryFee: orderData.deliveryFee,
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
  } catch {
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
