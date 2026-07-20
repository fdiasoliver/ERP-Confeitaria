export function rawDigits(v: string): string {
  return v.replace(/\D/g, "");
}

export function maskCEP(v: string): string {
  return rawDigits(v).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}
