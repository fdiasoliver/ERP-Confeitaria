"use client";

import { createContext, useContext, useRef } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";

/** `true` dentro de um EntityForm — `Section` (FormPrimitives) usa para se
 * desenhar como bloco com borda dentro do card do formulário, em vez de um
 * card próprio (evita card dentro de card). */
export const EntityFormContext = createContext(false);
export function useInEntityForm(): boolean {
  return useContext(EntityFormContext);
}

/**
 * Formulário de criação/edição de entidade em **tela cheia** (01/10/2026 —
 * pedido do Product Owner: cadastro e edição com o mesmo layout da página de
 * detalhe, ex. /admin/produtos/[id], nunca um pop-up). Ocupa toda a área de
 * conteúdo à direita da Sidebar (`md:left-60`, mesma largura fixa de
 * Sidebar.tsx) e a tela inteira no celular: cabeçalho com "←" + título, campos
 * num card branco e barra de ações fixa no rodapé.
 *
 * `wide` (padrão): campos em 2 colunas a partir de `md`; filhos que precisam da
 * linha inteira usam `md:col-span-2`. `compact`: 1 coluna, card mais estreito,
 * para formulários de 1–2 campos.
 *
 * Radix Dialog não-modal: foco inicial no primeiro campo e `Escape` fecham como
 * antes, mas a Sidebar continua clicável (navegar para outra tela descarta o
 * formulário, como numa página). Clique fora não fecha.
 */
export function EntityForm({
  title,
  submitting,
  submitLabel,
  cancelLabel = "Cancelar",
  size = "wide",
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  submitting: boolean;
  submitLabel: string;
  cancelLabel?: string;
  size?: "wide" | "compact";
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  const fieldsRef = useRef<HTMLDivElement>(null);
  const widthClass = size === "wide" ? "max-w-7xl" : "max-w-2xl";

  return (
    <DialogPrimitive.Root
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            const first = fieldsRef.current?.querySelector<HTMLElement>("input, select, textarea");
            if (first) {
              e.preventDefault();
              first.focus();
            }
          }}
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-cream outline-none data-open:animate-in data-open:fade-in-0 md:left-60"
        >
          <header className="sticky top-0 z-10 border-b border-sand bg-card px-5 py-4">
            <div className={`mx-auto flex items-center gap-3 ${widthClass}`}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                aria-label="Voltar"
                className="text-sm text-muted hover:text-chocolate disabled:opacity-50"
              >
                ←
              </button>
              <DialogPrimitive.Title className="font-display text-lg font-semibold text-chocolate">
                {title}
              </DialogPrimitive.Title>
            </div>
          </header>

          <EntityFormContext.Provider value={true}>
            <div className={`mx-auto w-full flex-1 p-5 ${widthClass}`}>
              <div className="shadow-card rounded-2xl bg-white p-5 md:p-6">
                <div
                  ref={fieldsRef}
                  className={
                    size === "wide"
                      ? "space-y-4 md:grid md:grid-cols-2 md:items-start md:gap-x-6 md:gap-y-4 md:space-y-0"
                      : "space-y-4"
                  }
                >
                  {children}
                </div>
              </div>
            </div>
          </EntityFormContext.Provider>

          <div className="sticky bottom-0 border-t border-sand bg-card/95 px-5 py-3 backdrop-blur">
            <div className={`mx-auto flex gap-3 ${widthClass}`}>
              <div className="flex w-full gap-3 md:ml-auto md:max-w-md">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                  {cancelLabel}
                </Button>
                <Button type="button" className="flex-1" onClick={onSubmit} disabled={submitting}>
                  {submitting ? "Salvando…" : submitLabel}
                </Button>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
