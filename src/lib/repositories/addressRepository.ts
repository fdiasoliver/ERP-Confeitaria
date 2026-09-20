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

// Usada antes de excluir — `Order.addressId` não tem onDelete configurado no
// schema (Restrict, padrão do Prisma para relação opcional sem @relation
// explícita), então a checagem de negócio evita o erro genérico de FK do banco
// e dá uma mensagem clara (ver AddressInUseError em customerService.ts).
export async function countOrdersByAddressId(addressId: string): Promise<number> {
  return prisma.order.count({ where: { addressId } });
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

export async function deleteAddress(id: string): Promise<void> {
  await prisma.address.delete({ where: { id } });
}
