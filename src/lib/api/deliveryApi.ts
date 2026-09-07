import type { DeliveryAddressInput } from "@/lib/types";

export interface DeliveryEligibility {
  distanceKm: number;
  isWithinFreeRadius: boolean;
  freeDeliveryRadiusKm: number;
}

export class ApiRequestError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

interface ApiSuccess<T> { success: true; data: T }
interface ApiError { success: false; error: { code: string; message: string } }
type ApiResponse<T> = ApiSuccess<T> | ApiError;

export async function checkDeliveryDistance(address: DeliveryAddressInput): Promise<DeliveryEligibility> {
  const res = await fetch("/api/delivery/distance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  const json: ApiResponse<DeliveryEligibility> = await res.json();
  if (!json.success) throw new ApiRequestError(json.error.code, json.error.message);
  return json.data;
}
