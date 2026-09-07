// Client da Routes API do Google (computeRouteMatrix) — único ponto de I/O HTTP
// para o Google Maps no projeto (ADR-023). A Distance Matrix API "clássica"
// está em modo legado (a própria documentação do Google recomenda a Routes
// API para implementações novas) — por isso usamos `computeRouteMatrix`, não
// a Distance Matrix API antiga.
//
// Detalhes verificados na documentação oficial (não de memória, por ser
// integração com dinheiro/decisão de frete):
// - Aceita endereço em texto puro via `waypoint.address` — não precisa
//   geocodificar antes.
// - Exige o header `X-Goog-FieldMask`; o campo `status` PRECISA estar na
//   mask, senão toda resposta aparenta "OK" mesmo quando não é.
// - A resposta é uma sequência em stream de objetos JSON (1 por par
//   origem/destino) — para 1×1 pode vir como array de 1 item ou objeto
//   único dependendo do transporte; o parser abaixo aceita os dois formatos.

const COMPUTE_ROUTE_MATRIX_URL = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";
const FIELD_MASK = "originIndex,destinationIndex,distanceMeters,duration,condition,status";

export type DistanceResult =
  | { success: true; distanceKm: number }
  | { success: false; error: string };

interface RouteMatrixElement {
  originIndex?: number;
  destinationIndex?: number;
  distanceMeters?: number;
  duration?: string;
  condition?: string;
  status?: { code?: number; message?: string };
}

function parseRouteMatrixResponse(raw: string): RouteMatrixElement[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Calcula a distância de condução (em km) entre dois endereços em texto puro
 * usando a Routes API do Google (`computeRouteMatrix`).
 */
export async function computeDeliveryDistanceKm(
  originAddress: string,
  destinationAddress: string,
): Promise<DistanceResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Google Maps não configurado (GOOGLE_MAPS_API_KEY ausente)." };
  }

  try {
    const res = await fetch(COMPUTE_ROUTE_MATRIX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        origins: [{ waypoint: { address: originAddress } }],
        destinations: [{ waypoint: { address: destinationAddress } }],
        travelMode: "DRIVE",
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("[googleMapsClient] HTTP error:", res.status, text);
      return { success: false, error: `Falha ao consultar o Google Maps (HTTP ${res.status}).` };
    }

    const elements = parseRouteMatrixResponse(text);
    const element = elements.find((e) => e.originIndex === 0 && e.destinationIndex === 0) ?? elements[0];

    if (!element) {
      return { success: false, error: "O Google Maps não retornou nenhum resultado para este endereço." };
    }
    if (element.status?.code) {
      return { success: false, error: element.status.message ?? "Erro ao calcular a rota." };
    }
    if (element.condition !== "ROUTE_EXISTS" || element.distanceMeters === undefined) {
      return { success: false, error: "Não foi possível encontrar uma rota até este endereço." };
    }

    return { success: true, distanceKm: element.distanceMeters / 1000 };
  } catch (err) {
    console.error("[googleMapsClient] Falha de rede:", err);
    return { success: false, error: "Falha de rede ao consultar o Google Maps." };
  }
}
