import type { MetadataRoute } from "next";
import { getStoreConfig } from "@/lib/storeConfigService";

// Cacheado por 1h (revalidate) em vez de consultar o banco a cada fetch do
// manifest — o layout raiz nunca depende do banco (evita repetir o ponto único
// de falha que causou o incidente de pool de conexões corrigido hoje mais
// cedo); um manifest.json é tolerável ficar em cache/servir stale por um
// tempo, diferente de uma página inteira.
export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let name = "Doce Menina";

  try {
    const config = await getStoreConfig();
    if (config.name) name = config.name;
  } catch {
    // Mantém o nome padrão — instabilidade do banco não pode impedir a
    // geração do manifest (só o nome fica genérico até o próximo revalidate).
  }

  return {
    name: `${name} — Confeitaria Artesanal`,
    short_name: name,
    description: "Encomendas de bolos, doces e docinhos artesanais",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EF",
    theme_color: "#191715",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
    ],
  };
}
