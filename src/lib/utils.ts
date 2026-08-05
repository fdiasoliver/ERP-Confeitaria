// Masks and string formatters → src/lib/formatters/
// Date formatting          → src/lib/formatters/date.ts
// Currency formatting      → src/lib/formatters/currency.ts

const PRODUCT_GRADIENTS = [
  "from-rose/30 to-sand",
  "from-sage/25 to-sand",
  "from-chocolate/15 to-sand",
  "from-surface-2 to-rose/25",
  "from-surface-2 to-sage/25",
] as const;

// Gradiente determinístico por produto — substitui o tratamento fixo de fundo
// (mesmo gradiente para todos os produtos) por um pouco de variação visual,
// sem depender de foto real (KI-06: imageUrl ainda não populada).
export function getProductGradientClass(productId: string): string {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PRODUCT_GRADIENTS.length;
  return PRODUCT_GRADIENTS[index];
}

export function getMinDeliveryDate(leadTimeDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + leadTimeDays);
  // Skip to Monday if the result falls on a weekend
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() + 2);
  if (day === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}
