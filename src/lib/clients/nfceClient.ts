// Client do portal público de Consulta NFC-e (SEFAZ-SP) — único ponto de I/O
// HTTP para esse portal no projeto (ADR-023). Cobre apenas notas emitidas por
// contribuintes registrados em São Paulo (cUF=35) — cada estado tem seu próprio
// portal/URL, fora de escopo do Módulo 5.E nesta primeira versão.
//
// Descoberto na prática (Sprint 5.E.2, testado contra nota real): a rota de
// busca manual por chave exige reCAPTCHA (inviável para automação); a rota de
// QR Code (`/qrcode?p=...`) só retorna a nota quando o payload inclui o hash de
// validação (5º campo, só existe no QR Code impresso — não é derivável a partir
// dos 44 dígitos da chave sozinhos). Por isso o importador exige o conteúdo
// completo do QR Code, não só a chave de acesso.

import * as cheerio from "cheerio";

const SP_QRCODE_BASE_URL = "https://www.nfce.fazenda.sp.gov.br/qrcode";

export interface NfceItem {
  description: string;
  code: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface NfceData {
  accessKey: string;
  issuerName: string;
  issuerCnpj: string | null;
  emittedAt: Date | null;
  totalValue: number | null;
  items: NfceItem[];
}

export type NfceFetchResult =
  | { success: true; data: NfceData }
  | { success: false; error: string };

/** Extrai o payload `p=` de um link completo de QR Code, ou aceita o payload cru. */
function extractQrPayload(qrCodeContent: string): string | null {
  const trimmed = qrCodeContent.trim();
  const match = trimmed.match(/[?&]p=([^&]+)/);
  const raw = match ? decodeURIComponent(match[1]) : trimmed;
  return raw.length > 0 ? raw : null;
}

/** Valida o formato da chave de acesso (44 dígitos) e o dígito verificador (mod-11). */
export function isValidNfceAccessKey(accessKey: string): boolean {
  if (!/^\d{44}$/.test(accessKey)) return false;

  const digits = accessKey.slice(0, 43).split("").map(Number);
  const checkDigit = Number(accessKey[43]);

  let weight = 2;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += digits[i] * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = sum % 11;
  const expectedDigit = remainder < 2 ? 0 : 11 - remainder;
  return expectedDigit === checkDigit;
}

function parseBrNumber(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, "").trim();
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? 0 : value;
}

function extractInlineErrorMessage(html: string): string | null {
  const match = html.match(/\$\('#spnErro\w*'\)\.html\('([^']*)'\)/);
  if (!match) return null;
  return match[1]
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNfceHtml(html: string, accessKey: string): NfceFetchResult {
  if (!html.includes('id="tabResult"')) {
    const inlineError = extractInlineErrorMessage(html);
    return {
      success: false,
      error: inlineError ?? "O portal da SEFAZ-SP não retornou os dados da nota (formato de resposta inesperado).",
    };
  }

  const $ = cheerio.load(html);

  const issuerName = $("#u20").text().trim();
  const issuerCnpjText = $(".txtCenter .text").first().text();
  const issuerCnpj = issuerCnpjText.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)?.[1] ?? null;

  const emittedAtText = $("body").text().match(/Emiss[ãa]o:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/)?.[1];
  let emittedAt: Date | null = null;
  if (emittedAtText) {
    const [datePart, timePart] = emittedAtText.split(/\s+/);
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);
    emittedAt = new Date(year, month - 1, day, hour, minute, second);
  }

  const items: NfceItem[] = [];
  $("#tabResult tr").each((_, el) => {
    const row = $(el);
    const cells = row.find("td");
    const firstCell = cells.eq(0);

    const description = firstCell.find(".txtTit").first().text().trim();
    if (!description) return;

    const code = firstCell.find(".RCod").text().match(/(\d{6,14})/)?.[1] ?? null;
    const quantity = parseBrNumber(firstCell.find(".Rqtd").text().replace(/.*Qtde\.:/i, ""));
    const unit = firstCell
      .find(".RUN")
      .text()
      .replace(/.*UN:\s*/i, "")
      .trim();
    const unitPrice = parseBrNumber(firstCell.find(".RvlUnit").text().replace(/.*Vl\. Unit\.:/i, ""));
    const totalPrice = parseBrNumber(cells.eq(1).find(".valor").text());

    items.push({ description, code, quantity, unit, unitPrice, totalPrice });
  });

  if (items.length === 0) {
    return { success: false, error: "Nenhum item foi encontrado nessa nota." };
  }

  const totalValueText = $("#totalNota .linhaShade .totalNumb").first().text();
  const totalValue = totalValueText ? parseBrNumber(totalValueText) : null;

  return {
    success: true,
    data: { accessKey, issuerName, issuerCnpj, emittedAt, totalValue, items },
  };
}

/**
 * Consulta uma NFC-e no portal público da SEFAZ-SP a partir do conteúdo
 * completo do QR Code (link ou payload cru — precisa incluir o hash de
 * validação, os 44 dígitos da chave sozinhos não são suficientes).
 */
export async function fetchNfceByQrCode(qrCodeContent: string): Promise<NfceFetchResult> {
  const payload = extractQrPayload(qrCodeContent);
  if (!payload) {
    return { success: false, error: "Conteúdo do QR Code vazio ou inválido." };
  }

  const segments = payload.split("|");
  const accessKey = segments[0] ?? "";

  if (!/^\d{44}$/.test(accessKey)) {
    return { success: false, error: "A chave de acesso deve ter 44 dígitos." };
  }
  if (accessKey.slice(0, 2) !== "35") {
    return { success: false, error: "Este importador só cobre notas emitidas em São Paulo (cUF=35) por enquanto." };
  }
  if (segments.length < 5) {
    return {
      success: false,
      error: "O QR Code precisa incluir o hash de validação (5 campos separados por \"|\") — cole o link completo, não só a chave de 44 dígitos.",
    };
  }
  if (!isValidNfceAccessKey(accessKey)) {
    return { success: false, error: "Dígito verificador da chave de acesso inválido." };
  }

  const url = `${SP_QRCODE_BASE_URL}?p=${encodeURIComponent(payload)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return { success: false, error: `Falha ao consultar o portal da SEFAZ-SP (HTTP ${res.status}).` };
    }

    const html = await res.text();
    return parseNfceHtml(html, accessKey);
  } catch (err) {
    console.error("[nfceClient] Falha de rede:", err);
    return { success: false, error: "Falha de rede ao consultar o portal da SEFAZ-SP." };
  }
}
