// Client Evolution API — único ponto de I/O HTTP para WhatsApp no projeto.
// Isolado aqui de propósito: se a instância do Product Owner usar uma versão
// da Evolution API com contrato diferente (número com/sem "+55", sufixo
// "@c.us", nome de campo), o ajuste fica restrito a este arquivo — nenhum
// Service ou Route conhece o formato real da API externa (ADR — CLAUDE.md).

interface SendResult {
  success: boolean;
  error?: string;
}

export async function sendWhatsAppMessage(phone: string, text: string): Promise<SendResult> {
  const baseUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;
  const instance = process.env.WHATSAPP_INSTANCE_ID;

  if (!baseUrl || !token || !instance) {
    return { success: false, error: "WhatsApp não configurado." };
  }

  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: token,
      },
      body: JSON.stringify({ number: phone, text }),
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
