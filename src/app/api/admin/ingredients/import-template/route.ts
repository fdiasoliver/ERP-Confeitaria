import { NextResponse } from "next/server";
import { requireProductionChain } from "@/lib/auth/requireProductionChain";
import { generateIngredientTemplate } from "@/lib/ingredientImportService";

export async function GET() {
  const denied = await requireProductionChain();
  if (denied) return denied;

  const buffer = await generateIngredientTemplate();

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="ingredientes-template.xlsx"',
    },
  });
}
