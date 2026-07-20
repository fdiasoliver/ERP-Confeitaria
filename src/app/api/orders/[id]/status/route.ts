import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/lib/types";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RASCUNHO: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EM_PRODUCAO", "CANCELADO"],
  EM_PRODUCAO: ["PRONTO", "CANCELADO"],
  PRONTO: ["SAIU_ENTREGA", "ENTREGUE"],
  SAIU_ENTREGA: ["ENTREGUE"],
  ENTREGUE: [],
  CANCELADO: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status: OrderStatus; notes?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  if (!body.status) {
    return NextResponse.json({ error: "Campo status obrigatório" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[order.status as OrderStatus];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { error: `Transição inválida: ${order.status} → ${body.status}` },
        { status: 422 }
      );
    }

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const o = await tx.order.update({
        where: { id },
        data: { status: body.status },
        include: { items: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: body.status,
          notes: body.notes ?? null,
        },
      });

      return o;
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
