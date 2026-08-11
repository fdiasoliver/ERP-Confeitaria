import {
  createOtpCode,
  findLatestOtpCode,
  incrementAttempts,
  markOtpCodeUsed,
} from "@/lib/repositories/otpRepository";
import { logWhatsAppMessage } from "@/lib/repositories/whatsappLogRepository";
import { sendWhatsAppMessage } from "@/lib/clients/whatsappClient";

// ─── Erros de domínio ─────────────────────────────────────────────────────────

export class OtpNotFoundError extends Error {
  constructor() {
    super("Código não encontrado. Solicite um novo código.");
  }
}

export class OtpExpiredError extends Error {
  constructor() {
    super("Código expirado. Solicite um novo código.");
  }
}

export class OtpAlreadyUsedError extends Error {
  constructor() {
    super("Código já utilizado. Solicite um novo código.");
  }
}

export class OtpMaxAttemptsError extends Error {
  constructor() {
    super("Número máximo de tentativas excedido. Solicite um novo código.");
  }
}

export class OtpInvalidCodeError extends Error {
  constructor() {
    super("Código incorreto.");
  }
}

// ─── Regras (REGRAS_NEGOCIO.md 15.5, regra 14) ─────────────────────────────────
const OTP_EXPIRATION_MINUTES = 5;
const OTP_MAX_ATTEMPTS = 3;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestOtp(phone: string): Promise<void> {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);
  await createOtpCode(phone, code, expiresAt);

  const message = `Seu código de acesso Doce Menina é: ${code}. Válido por ${OTP_EXPIRATION_MINUTES} minutos.`;
  const result = await sendWhatsAppMessage(phone, message);

  await logWhatsAppMessage({
    phone,
    message,
    template: "otp_code",
    success: result.success,
    error: result.error,
  });
}

export async function validateOtp(phone: string, code: string): Promise<void> {
  const otp = await findLatestOtpCode(phone);
  if (!otp) throw new OtpNotFoundError();
  if (otp.usedAt) throw new OtpAlreadyUsedError();
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw new OtpMaxAttemptsError();
  if (otp.expiresAt < new Date()) throw new OtpExpiredError();

  if (otp.code !== code) {
    await incrementAttempts(otp.id);
    throw new OtpInvalidCodeError();
  }

  await markOtpCodeUsed(otp.id);
}
