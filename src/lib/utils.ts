import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Masks and string formatters → src/lib/formatters/
// Date formatting          → src/lib/formatters/date.ts
// Currency formatting      → src/lib/formatters/currency.ts

export function getMinDeliveryDate(leadTimeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  // Skip to Monday if the result falls on a weekend
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() + 2);
  if (day === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}
