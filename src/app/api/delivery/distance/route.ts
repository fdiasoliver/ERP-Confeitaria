import { NextRequest, NextResponse } from "next/server";
import { checkFreeDeliveryEligibility, DistanceCalculationFailedError } from "@/lib/deliveryService";
import type { DeliveryAddressInput } from "@/lib/types";

interface DistanceBody {
  address?: Partial<DeliveryAddressInput>;
}

function isCompleteAddress(address: Partial<DeliveryAddressInput> | undefined): address is DeliveryAddressInput {
  return Boolean(
    address?.street && address.number && address.neighborhood && address.city && address.state,
  );
}

export async function POST(request: NextRequest) {
  let body: DistanceBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_BODY", message: "Corpo da requisição inválido." } },
      { status: 400 },
    );
  }

  if (!isCompleteAddress(body.address)) {
    return NextResponse.json(
      { success: false, error: { code: "INCOMPLETE_ADDRESS", message: "Endereço incompleto (rua, número, bairro, cidade e estado são obrigatórios)." } },
      { status: 400 },
    );
  }

  try {
    const eligibility = await checkFreeDeliveryEligibility(body.address);
    return NextResponse.json({ success: true, data: eligibility });
  } catch (err) {
    if (err instanceof DistanceCalculationFailedError) {
      return NextResponse.json(
        { success: false, error: { code: "DISTANCE_CALCULATION_FAILED", message: err.message } },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Erro interno do servidor." } },
      { status: 500 },
    );
  }
}
