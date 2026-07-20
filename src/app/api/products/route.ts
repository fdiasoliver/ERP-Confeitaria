import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        occasions: { include: { occasion: true } },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
