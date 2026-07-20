import type { StoreConfigInput, ValidationError, PixKeyType } from "@/lib/types";

const PIX_KEY_TYPES: PixKeyType[] = ["CPF", "CNPJ", "EMAIL", "TELEFONE", "ALEATORIA"];

export function validateStoreConfig(input: StoreConfigInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // name — obrigatório, máx 100 chars
  if (!input.name || input.name.trim() === "") {
    errors.push({ field: "name", code: "REQUIRED", message: "Nome da empresa é obrigatório." });
  } else if (input.name.trim().length > 100) {
    errors.push({ field: "name", code: "MAX_LENGTH", message: "Nome deve ter no máximo 100 caracteres." });
  }

  // email — formato válido se fornecido
  if (input.email && input.email.trim() !== "") {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(input.email.trim())) {
      errors.push({ field: "email", code: "INVALID_FORMAT", message: "E-mail inválido." });
    }
  }

  // cnpj — 14 dígitos numéricos se fornecido
  if (input.cnpj && input.cnpj.trim() !== "") {
    const digits = input.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      errors.push({ field: "cnpj", code: "INVALID_FORMAT", message: "CNPJ deve ter 14 dígitos." });
    }
  }

  // phone — 10 ou 11 dígitos se fornecido
  if (input.phone && input.phone.trim() !== "") {
    const digits = input.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      errors.push({ field: "phone", code: "INVALID_FORMAT", message: "Telefone inválido. Use DDD + número." });
    }
  }

  // freeDeliveryRadiusKm — 0 a 50
  if (input.freeDeliveryRadiusKm < 0) {
    errors.push({ field: "freeDeliveryRadiusKm", code: "MIN_VALUE", message: "Raio deve ser maior ou igual a 0." });
  } else if (input.freeDeliveryRadiusKm > 50) {
    errors.push({ field: "freeDeliveryRadiusKm", code: "MAX_VALUE", message: "Raio máximo permitido é 50 km." });
  }

  // laborCostPerHour — mínimo 0
  if (input.laborCostPerHour < 0) {
    errors.push({ field: "laborCostPerHour", code: "MIN_VALUE", message: "Custo de mão de obra não pode ser negativo." });
  }

  // fixedCostMonthly — mínimo 0
  if (input.fixedCostMonthly < 0) {
    errors.push({ field: "fixedCostMonthly", code: "MIN_VALUE", message: "Custos fixos não podem ser negativos." });
  }

  // monthlyProductionUnits — mínimo 1
  if (!Number.isInteger(input.monthlyProductionUnits) || input.monthlyProductionUnits < 1) {
    errors.push({ field: "monthlyProductionUnits", code: "MIN_VALUE", message: "Produção mensal deve ser pelo menos 1 unidade." });
  }

  // targetMarginPercent — 0 a 100
  if (input.targetMarginPercent < 0) {
    errors.push({ field: "targetMarginPercent", code: "MIN_VALUE", message: "Margem não pode ser negativa." });
  } else if (input.targetMarginPercent > 100) {
    errors.push({ field: "targetMarginPercent", code: "MAX_VALUE", message: "Margem não pode ultrapassar 100%." });
  }

  // addressZip — 8 dígitos se fornecido
  if (input.addressZip && input.addressZip.trim() !== "") {
    const digits = input.addressZip.replace(/\D/g, "");
    if (digits.length !== 8) {
      errors.push({ field: "addressZip", code: "INVALID_FORMAT", message: "CEP deve ter 8 dígitos." });
    }
  }

  // pixKey + pixKeyType — devem ser ambos preenchidos ou ambos vazios
  const hasType = input.pixKeyType !== null && input.pixKeyType !== undefined;
  const hasKey = input.pixKey !== null && input.pixKey !== undefined && input.pixKey.trim() !== "";

  if (hasType && !hasKey) {
    errors.push({ field: "pixKey", code: "INCONSISTENT", message: "Informe a chave PIX correspondente ao tipo selecionado." });
  }
  if (!hasType && hasKey) {
    errors.push({ field: "pixKeyType", code: "INCONSISTENT", message: "Selecione o tipo da chave PIX." });
  }

  // pixKeyType — valor válido do enum
  if (hasType && !PIX_KEY_TYPES.includes(input.pixKeyType as PixKeyType)) {
    errors.push({ field: "pixKeyType", code: "INVALID_ENUM", message: "Tipo de chave PIX inválido." });
  }

  return errors;
}
