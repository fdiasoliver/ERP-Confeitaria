"use client";

import { useEffect } from "react";

/** Registra public/sw.js — só o necessário para o navegador oferecer
 * "instalar app" (critério de instalabilidade do Chrome). Falha
 * silenciosamente (navegador sem suporte, extensão bloqueando, etc.) — nunca
 * deve impedir o carregamento normal do site. */
export function PwaServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
