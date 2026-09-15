// Client Evolution API — único ponto de I/O HTTP para WhatsApp no projeto.
// Isolado aqui de propósito: se a instância do Product Owner usar uma versão
// da Evolution API com contrato diferente (número com/sem "+55", sufixo
// "@c.us", nome de campo), o ajuste fica restrito a este arquivo — nenhum
// Service ou Route conhece o formato real da API externa (ADR — CLAUDE.md).

interface SendResult {
  success: boolean;
  error?: string;
}

// A Evolution API (Baileys) valida o número contra o WhatsApp real antes de
// enviar — um número brasileiro sem o DDI 55 é resolvido para um JID que não
// existe ("exists": false, HTTP 400), mesmo sendo um número válido. O telefone
// chega aqui em qualquer formato que o cliente tenha digitado (com máscara,
// com/sem 55) — normalizamos para o formato que a Evolution API espera, sem
// exigir que nenhum Service/Route conheça essa regra (mesmo isolamento de
// formato específico do provedor já usado no resto deste arquivo).
function normalizeBrazilianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return digits;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export async function sendWhatsAppMessage(phone: string, text: string): Promise<SendResult> {
  const baseUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const instance = process.env.WHATSAPP_INSTANCE_ID;

  if (!baseUrl || !token || !instance) {
    return { success: false, error: "WhatsApp não configurado." };
  }

  const number = normalizeBrazilianPhone(phone);

  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: token,
      },
      body: JSON.stringify({ number, text }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[whatsappClient] Evolution API error:", res.status, detail);
      return { success: false, error: `Falha ao enviar mensagem (HTTP ${res.status}).` };
    }

    return { success: true };
  } catch (err) {
    console.error("[whatsappClient] Falha de rede:", err);
    return { success: false, error: "Falha de rede ao enviar mensagem." };
  }
}
