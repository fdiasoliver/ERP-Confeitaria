import { prisma } from "@/lib/prisma";
import type { Address } from "@prisma/client";

// ─── Leitura ────────────────────────────────────────────────────────────────

export async function findAddressesByCustomerId(customerId: string): Promise<Address[]> {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
  });
}

// Necessária para checagem de ownership em src/app/api/orders/route.ts (endereço
// salvo escolhido pelo cliente no checkout) — reaproveitada, não duplicada.
export async function findAddressById(id: string): Promise<Address | null> {
  return prisma.address.findUnique({ where: { id } });
}

// ─── Escrita ────────────────────────────────────────────────────────────────

export async function createAddress(
  customerId: string,
  data: {
    label?: string | null;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  },
): Promise<Address> {
  return prisma.address.create({ data: { customerId, ...data } });
}

export async function updateAddress(
  id: string,
  data: {
    label?: string | null;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  },
): Promise<Address> {
  return prisma.address.update({ where: { id }, data });
}
