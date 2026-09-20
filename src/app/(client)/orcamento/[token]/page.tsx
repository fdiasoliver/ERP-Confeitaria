"use client";

import { useState, useEffect, use, type ReactNode } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/mock-data";
import { PAYMENT_LABELS, QUOTE_STATUS_LABELS } from "@/lib/types";
import type { StoreConfig } from "@/lib/types";
import * as publicQuoteApi from "@/lib/api/publicQuoteApi";
import { ApiRequestError, type PublicQuoteDTO } from "@/lib/api/publicQuoteApi";

// Tela pública para onde aponta o link enviado por WhatsApp (notifyQuoteShared,
// whatsappNotificationService.ts). Sem autenticação — o token na URL é a única
// credencial; nenhum dado além do PublicQuoteDTO (já minimizado no backend)
// chega a este componente.
//
// Design (correção solicitada pelo Product Owner): reproduz o "documento de
// orçamento" em HTML já aprovado (arquivo de referência entregue por fora do
// repositório) — folha estilo proposta impressa, paleta vinho/dourado/papel,
// tipografia serifada itálica, seções numeradas em algarismos romanos (I-IV).
// Cores e fontes são específicas deste documento, não os tokens do resto do
// admin/cliente (cream/chocolate/rose/sage) — decisão deliberada de manter o
// mesmo visual do arquivo de referência neste ponto único de contato externo.

const COLORS = {
  ink: "#2B2320",
  inkSoft: "#6E5F5A",
  wine: "#7C3B41",
  wineDeep: "#5E2B30",
  rose: "#C08983",
  gold: "#AD8A54",
  paper: "#FBF8F3",
  paperAlt: "#F3EAE0",
  line: "#DCCBBF",
  lineSoft: "#EAE0D6",
} as const;

const SERIF = "Georgia, 'Times New Roman', 'Palatino Linotype', serif";

type Decision = "APROVADO" | "RECUSADO";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function OrcamentoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [quote, setQuote] = useState<PublicQuoteDTO | null>(null);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [itemActionId, setItemActionId] = useState<string | null>(null);
  const [decisionModal, setDecisionModal] = useState<Decision | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await publicQuoteApi.getPublicQuote(token);
      setQuote(data);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dados da loja (nome/logo/contato) para o cabeçalho e rodapé do documento —
  // mesmo padrão de fetch de admin/config/page.tsx (endpoint público, sem auth).
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: StoreConfig) => setStoreConfig(data))
      .catch(() => {});
  }, []);

  async function handleQuantityChange(itemId: string, quantity: number) {
    if (quantity <= 0) return;
    setItemActionId(itemId);
    try {
      const updated = await publicQuoteApi.updateItemQuantity(token, itemId, quantity);
      setQuote(updated);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao atualizar item.");
      await load(true);
    } finally {
      setItemActionId(null);
    }
  }

  async function handleRemoveItem(itemId: string) {
    setItemActionId(itemId);
    try {
      const updated = await publicQuoteApi.removeItem(token, itemId);
      setQuote(updated);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao remover item.");
      await load(true);
    } finally {
      setItemActionId(null);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <p className="p-10 text-center text-sm" style={{ color: COLORS.inkSoft }}>
          Carregando…
        </p>
      </PageShell>
    );
  }

  if (notFound || !quote) {
    return (
      <PageShell>
        <div className="p-10 text-center">
          <p className="text-lg font-semibold" style={{ fontFamily: SERIF, color: COLORS.wineDeep }}>
            Orçamento não encontrado
          </p>
          <p className="mt-2 text-sm" style={{ color: COLORS.inkSoft }}>
            O link pode estar incorreto ou o orçamento não existe mais. Fale com a gente para receber um novo link.
          </p>
        </div>
      </PageShell>
    );
  }

  const storeName = storeConfig?.name || "Confeitaria Artesanal";
  const numero = String(quote.orderNumber).padStart(4, "0");

  return (
    <PageShell>
      <div className="mb-4 flex justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-sm border px-5 py-2.5 text-[11.5px] font-medium uppercase tracking-wider transition-transform hover:-translate-y-px"
          style={{ borderColor: COLORS.wine, color: COLORS.wine }}
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <div className="p-1.5" style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}`, boxShadow: "0 24px 60px rgba(43,35,32,.14)" }}>
        <div className="relative px-6 py-10 sm:px-14 sm:py-11" style={{ border: `1px solid ${COLORS.lineSoft}` }}>
          {!quote.editable && (
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[9.5px] font-medium uppercase tracking-widest"
              style={{ color: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
            >
              <LockIcon />
              Orçamento {QUOTE_STATUS_LABELS[quote.quoteStatus].toLowerCase()} — não pode mais ser alterado
            </div>
          )}

          {/* Masthead */}
          <div
            className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between"
            style={{ borderBottom: `1px solid ${COLORS.line}` }}
          >
            <div className="flex items-center gap-4">
              {storeConfig?.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={storeConfig.logoUrl} alt={storeName} className="h-14 w-14 object-contain" />
              )}
              <div>
                <div className="text-[28px] font-semibold italic" style={{ fontFamily: SERIF, color: COLORS.wineDeep }}>
                  {storeName}
                </div>
                <div className="mt-1 text-[9.5px] uppercase tracking-[2.6px]" style={{ color: COLORS.inkSoft }}>
                  Ateliê de Confeitaria Artesanal
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] font-medium uppercase tracking-[3px]" style={{ color: COLORS.gold }}>
                Confeitaria
              </div>
              <div className="mt-0.5 text-[26px] italic" style={{ fontFamily: SERIF, color: COLORS.ink }}>
                Orçamento
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap gap-6">
            <MetaField label="Nº do orçamento" value={numero} />
            <MetaField label="Data do orçamento" value={formatDateTime(quote.createdAt)} />
            <MetaField label="Data de entrega" value={formatDateTime(`${quote.deliveryDate}T12:00:00`)} />
          </div>

          {/* I. Dados do cliente */}
          <SectionHeading num="I." text="Dados do cliente" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[1.6fr_1fr]">
            <ROField label="Nome" value={quote.customer.name} full />
            <ROField label="Telefone" value={quote.receiverPhone ?? quote.customer.phone ?? "—"} />
            {quote.customer.type === "CORPORATIVO" && quote.customer.companyName && (
              <ROField label="Empresa" value={quote.customer.companyName} full />
            )}
            {quote.deliveryType === "RETIRADA" ? (
              <ROField label="Entrega" value="Retirada na loja" full />
            ) : (
              quote.address && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:col-span-2 sm:grid-cols-[1fr_100px_130px]">
                    <ROField label="Endereço" value={quote.address.street} />
                    <ROField label="Nº" value={quote.address.number} />
                    <ROField label="Complemento" value={quote.address.complement ?? "—"} />
                  </div>
                  <ROField label="Bairro" value={quote.address.neighborhood} />
                  <ROField label="Cidade" value={`${quote.address.city}/${quote.address.state}`} />
                </>
              )
            )}
          </div>

          {/* II. Itens do pedido */}
          <SectionHeading num="II." text="Itens do pedido" />
          {quote.editable && (
            <p className="-mt-2.5 mb-3.5 text-xs" style={{ color: COLORS.inkSoft }}>
              Você pode ajustar a quantidade de cada item ou remover itens que não deseja — os demais dados não são
              editáveis.
            </p>
          )}
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th align="left">Produto</Th>
                <Th align="center" width={72}>
                  Qtd
                </Th>
                <Th align="right" width={100}>
                  Unitário
                </Th>
                <Th align="right" width={110}>
                  Total
                </Th>
                {quote.editable && <Th align="center" width={26} />}
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <Td>{item.productName}</Td>
                  <Td align="center">
                    {quote.editable ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={itemActionId === item.id || item.quantity <= 1}
                          aria-label={`Diminuir quantidade de ${item.productName}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs disabled:opacity-30"
                          style={{ background: COLORS.paperAlt, color: COLORS.wineDeep }}
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={itemActionId === item.id}
                          aria-label={`Aumentar quantidade de ${item.productName}`}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs disabled:opacity-30"
                          style={{ background: COLORS.paperAlt, color: COLORS.wineDeep }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      item.quantity
                    )}
                  </Td>
                  <Td align="right">{formatCurrency(item.unitPrice)}</Td>
                  <Td align="right">
                    <span className="font-medium" style={{ color: COLORS.wine }}>
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </Td>
                  {quote.editable && (
                    <Td align="center">
                      {quote.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={itemActionId === item.id}
                          title="Remover item"
                          className="text-sm opacity-50 hover:opacity-100 disabled:opacity-20"
                          style={{ color: COLORS.rose }}
                        >
                          ✕
                        </button>
                      )}
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="mt-5 flex items-center justify-end gap-7 pt-4"
            style={{ borderTop: `1px solid ${COLORS.line}` }}
          >
            <span className="text-[10px] uppercase tracking-[2.4px]" style={{ color: COLORS.inkSoft }}>
              Total do pedido
            </span>
            <span className="text-[34px] font-semibold" style={{ fontFamily: SERIF, color: COLORS.wineDeep }}>
              {formatCurrency(quote.total)}
            </span>
          </div>
          {quote.deliveryFee > 0 && (
            <p className="mt-1 text-right text-xs" style={{ color: COLORS.inkSoft }}>
              (inclui {formatCurrency(quote.deliveryFee)} de entrega)
            </p>
          )}

          {/* III. Forma de pagamento */}
          <SectionHeading num="III." text="Forma de pagamento" />
          <span
            className="inline-block rounded-full px-3.5 py-1.5 text-xs"
            style={{ border: `1px solid ${COLORS.wine}`, color: COLORS.wineDeep }}
          >
            {PAYMENT_LABELS[quote.paymentMethod]}
          </span>

          {/* IV. Observações */}
          <SectionHeading num="IV." text="Observações" />
          <p className="text-[13.5px] leading-relaxed" style={{ color: quote.orderNotes ? COLORS.ink : COLORS.inkSoft, fontStyle: quote.orderNotes ? "normal" : "italic" }}>
            {quote.orderNotes || "Sem observações."}
          </p>

          {/* Decisão do cliente (fora do documento de referência — funcionalidade própria desta tela) */}
          {quote.editable && (
            <div className="mt-10 flex gap-3 print:hidden">
              <button
                type="button"
                onClick={() => setDecisionModal("RECUSADO")}
                className="flex-1 rounded-sm border py-3 text-sm font-medium uppercase tracking-wide transition-colors"
                style={{ borderColor: COLORS.rose, color: COLORS.wineDeep }}
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={() => setDecisionModal("APROVADO")}
                className="flex-1 rounded-sm py-3 text-sm font-medium uppercase tracking-wide text-white"
                style={{ background: COLORS.wine }}
              >
                Aprovar orçamento
              </button>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-11 flex flex-wrap items-center justify-center gap-2.5 pt-5 text-center text-[11.5px]"
            style={{ borderTop: `1px solid ${COLORS.line}`, color: COLORS.inkSoft }}
          >
            <div className="w-full text-[13px] italic" style={{ fontFamily: SERIF, color: COLORS.rose }}>
              Obrigada pela preferência
            </div>
            {storeConfig?.instagram && <span>@{storeConfig.instagram.replace(/^@/, "")}</span>}
            {storeConfig?.instagram && (storeConfig.phone || storeConfig.email) && (
              <span style={{ color: COLORS.gold }}>·</span>
            )}
            {storeConfig?.phone && <span>{storeConfig.phone}</span>}
            {storeConfig?.phone && storeConfig?.email && <span style={{ color: COLORS.gold }}>·</span>}
            {storeConfig?.email && <span>{storeConfig.email}</span>}
          </div>
        </div>
      </div>

      {decisionModal && (
        <DecisionModal
          decision={decisionModal}
          token={token}
          onClose={() => setDecisionModal(null)}
          onDecided={(updated) => {
            setQuote(updated);
            setDecisionModal(null);
          }}
        />
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen py-10" style={{ background: COLORS.paper }}>
      <div className="mx-auto max-w-[900px] px-4 sm:px-6">{children}</div>
    </div>
  );
}

function SectionHeading({ num, text }: { num: string; text: string }) {
  return (
    <div className="my-9 flex items-center gap-3.5">
      <span className="text-lg italic" style={{ fontFamily: SERIF, color: COLORS.gold }}>
        {num}
      </span>
      <span className="whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[2.4px]" style={{ color: COLORS.wineDeep }}>
        {text}
      </span>
      <span className="h-px flex-1" style={{ background: COLORS.line }} />
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[150px] flex-1">
      <div className="mb-1.5 text-[9.5px] uppercase tracking-[2px]" style={{ color: COLORS.inkSoft }}>
        {label}
      </div>
      <div className="border-b pb-1.5 text-sm" style={{ borderColor: COLORS.line, color: COLORS.ink }}>
        {value}
      </div>
    </div>
  );
}

function ROField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="mb-1.5 text-[9.5px] uppercase tracking-[2px]" style={{ color: COLORS.inkSoft }}>
        {label}
      </div>
      <div className="border-b pb-1.5 text-sm" style={{ borderColor: COLORS.lineSoft, color: COLORS.ink }}>
        {value}
      </div>
    </div>
  );
}

// Tailwind não reconhece classe montada por interpolação (`text-${align}`) —
// o JIT só compila utilitários que aparecem como string literal completa no
// código-fonte; por isso o alinhamento vai no `style` inline, não na classe.
const TEXT_ALIGN: Record<"left" | "center" | "right", "left" | "center" | "right"> = {
  left: "left",
  center: "center",
  right: "right",
};

function Th({ children, align, width }: { children?: ReactNode; align: "left" | "center" | "right"; width?: number }) {
  return (
    <th
      className="border-b pb-2.5 text-[9.5px] font-medium uppercase tracking-[1.8px]"
      style={{ borderColor: COLORS.wineDeep, color: COLORS.wineDeep, width, padding: "0 8px 10px", textAlign: TEXT_ALIGN[align] }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: ReactNode; align?: "left" | "center" | "right" }) {
  return (
    <td
      className="border-b py-3 text-[13.5px]"
      style={{ borderColor: COLORS.lineSoft, color: COLORS.ink, padding: "12px 8px", textAlign: TEXT_ALIGN[align] }}
    >
      {children}
    </td>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" style={{ color: COLORS.gold }}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// Confirmação de segurança — últimos 4 dígitos do telefone ou CNPJ cadastrado
// (o backend aceita qualquer um dos dois, ver decideQuote em orderService.ts).
// Mensagem de erro deliberadamente genérica, nunca revela qual campo.
function DecisionModal({
  decision,
  token,
  onClose,
  onDecided,
}: {
  decision: Decision;
  token: string;
  onClose: () => void;
  onDecided: (quote: PublicQuoteDTO) => void;
}) {
  const [last4, setLast4] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isApprove = decision === "APROVADO";

  async function handleConfirm() {
    if (!/^\d{4}$/.test(last4)) {
      setError("Digite os 4 últimos dígitos.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const updated = await publicQuoteApi.decideQuote(token, decision, last4);
      onDecided(updated);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "FORBIDDEN") {
        setError("Confirmação inválida. Verifique os dígitos e tente novamente.");
      } else if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Erro ao registrar sua decisão.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-t-lg p-6 sm:rounded-lg"
        style={{ background: COLORS.paper, boxShadow: "0 24px 60px rgba(43,35,32,.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold" style={{ fontFamily: SERIF, color: COLORS.wineDeep }}>
          {isApprove ? "Confirmar aprovação do orçamento" : "Confirmar recusa do orçamento"}
        </p>
        <p className="mt-1.5 text-sm" style={{ color: COLORS.inkSoft }}>
          Por segurança, digite os 4 últimos dígitos do seu telefone ou CNPJ cadastrado.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          className="mt-4 w-full border-0 border-b bg-transparent pb-2 text-lg outline-none"
          style={{ borderColor: error ? "#B33" : COLORS.line, color: COLORS.ink }}
          placeholder="0000"
          value={last4}
          onChange={(e) => {
            setLast4(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(null);
          }}
          disabled={submitting}
          autoFocus
        />
        {error && (
          <p className="mt-1.5 text-xs" style={{ color: "#B33" }}>
            {error}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-sm border py-3 text-sm font-medium disabled:opacity-50"
            style={{ borderColor: COLORS.line, color: COLORS.ink }}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-sm py-3 text-sm font-medium text-white disabled:opacity-50"
            style={{ background: isApprove ? COLORS.wine : "#B33" }}
          >
            {submitting ? "Enviando…" : isApprove ? "Confirmar aprovação" : "Confirmar recusa"}
          </button>
        </div>
      </div>
    </div>
  );
}
