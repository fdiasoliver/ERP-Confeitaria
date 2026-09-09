import { ImageResponse } from "next/og";

// Ícone gerado (não depende de StoreConfig.faviconUrl no banco) — substitui o
// favicon.ico padrão do Next.js. Deliberado: o layout raiz nunca deve depender
// de uma consulta ao banco para renderizar (mesma preocupação que motivou a
// correção do pool de conexões hoje mais cedo) — o favicon real enviado pelo
// Product Owner em /admin/config permanece uma pendência separada, sinalizada
// no CHANGELOG, não resolvida aqui.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#191715",
          color: "#FAF6EF",
          fontSize: 260,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        DM
      </div>
    ),
    { ...size },
  );
}
