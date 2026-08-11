import { prisma } from "@/lib/prisma";
import type { WhatsAppLog } from "@prisma/client";

interface LogWhatsAppMessageInput {
  phone: string;
  message: string;
  template?: string;
  orderId?: string;
  success: boolean;
  error?: string;
}

export async function logWhatsAppMessage(input: LogWhatsAppMessageInput): Promise<WhatsAppLog> {
  return prisma.whatsAppLog.create({
    data: {
      phone: input.phone,
      message: input.message,
      template: input.template,
      orderId: input.orderId,
      success: input.success,
      error: input.error,
    },
  });
}
