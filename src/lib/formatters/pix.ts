import type { PixKeyType } from "@/lib/types";

const PIX_PLACEHOLDERS: Record<PixKeyType, string> = {
  CPF: "000.000.000-00",
  CNPJ: "00.000.000/0001-00",
  EMAIL: "email@exemplo.com",
  TELEFONE: "+55 11 99999-9999",
  ALEATORIA: "Chave aleatória UUID",
};

export function getPixPlaceholder(type: PixKeyType): string {
  return PIX_PLACEHOLDERS[type];
}
