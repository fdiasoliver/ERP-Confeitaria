import { useEffect, useState } from "react";
import type { ViewMode } from "@/components/shared/ViewToggle";

const STORAGE_PREFIX = "admin-view:";

function readStored(key: string): ViewMode | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw === "grid" || raw === "list" ? raw : null;
  } catch {
    return null;
  }
}

/** Persiste a escolha Cards/Lista por tela (chave por página) no localStorage do
 * navegador — preferência por dispositivo, não sincronizada entre usuários/telas.
 * Inicializa sempre em `default` no primeiro render (server e client precisam
 * bater, senão o React acusa hydration mismatch) e só lê o valor salvo depois de
 * montado, em um efeito — por isso a visão pode "piscar" de Cards para Lista no
 * primeiro carregamento se o usuário tinha escolhido Lista antes. */
export function useViewMode(key: string, defaultMode: ViewMode = "grid"): [ViewMode, (mode: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    const stored = readStored(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lê preferência salva só uma vez após montar (evita hydration mismatch)
    if (stored) setView(stored);
  }, [key]);

  function update(mode: ViewMode) {
    setView(mode);
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, mode);
    } catch {
      // localStorage indisponível (modo privado, storage bloqueado) — a escolha
      // ainda funciona nesta sessão, só não persiste entre recarregamentos.
    }
  }

  return [view, update];
}
