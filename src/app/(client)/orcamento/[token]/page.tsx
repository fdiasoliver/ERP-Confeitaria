"use client";

import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { HeaderMinimal } from "@/components/layout/Header";
import { formatCurrency } from "@/lib/mock-data";
import { formatDate } from "@/lib/formatters/date";
import { PAYMENT_LABELS, QUOTE_STATUS_LABELS } from "@/lib/types";
import * as publicQuoteApi from "@/lib/api/publicQuoteApi";
import { ApiRequestError, type PublicQuoteDTO } from "@/lib/api/publicQuoteApi";

// Tela pública para onde aponta o link enviado por WhatsApp (notifyQuoteShared,
// whatsappNotificationService.ts). Sem autenticação — o token na URL é a única
// credencial; nenhum dado além do PublicQuoteDTO (já minimizado no backend)
// chega a este componente.

type Decision = "APROVADO" | "RECUSADO";

export default function OrcamentoPublicoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [quote, setQuote] = useState<PublicQuoteDTO | null>(null);
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
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Orçamento" />
        <p className="p-8 text-center text-sm text-muted">Carregando…</p>
      </div>
    );
  }

  if (notFound || !quote) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Orçamento" />
        <div className="p-8 text-center">
          <p className="text-lg font-semibold text-chocolate">Orçamento não encontrado</p>
          <p className="mt-2 text-sm text-muted">
            O link pode estar incorreto ou o orçamento não existe mais. Fale com a Doce Menina para receber um novo
            link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8">
      <HeaderMinimal title={`Orçamento #${quote.orderNumber}`} />

      <div className="space-y-5 p-5">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="text-sm text-muted">
            Olá, {quote.customer.name}. Este é o orçamento solicitado à Doce Menina.
          </p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Entrega prevista</span>
            <span className="font-semibold text-chocolate">{formatDate(quote.deliveryDate)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted">Status</span>
            <span className="font-semibold text-chocolate">{QUOTE_STATUS_LABELS[quote.quoteStatus]}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Itens</p>
          <div className="space-y-3">
            {quote.items.map((item) => (
              <div key={item.id} className="rounded-xl bg-card p-3 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-chocolate">{item.productName}</p>
                  <p className="text-sm font-semibold text-chocolate">{formatCurrency(item.totalPrice)}</p>
                </div>
                <p className="text-xs text-muted">{formatCurrency(item.unitPrice)} cada</p>

                {quote.editable && (
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={itemActionId === item.id || item.quantity <= 1}
                        aria-label={`Diminuir quantidade de ${item.productName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-chocolate disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-chocolate">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={itemActionId === item.id}
                        aria-label={`Aumentar quantidade de ${item.productName}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-sand text-chocolate disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    {quote.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={itemActionId === item.id}
                        className="text-xs font-semibold text-rose disabled:opacity-50"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                )}

                {!quote.editable && <p className="mt-1 text-xs text-muted">Quantidade: {item.quantity}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-sand/40 p-3">
          <Row label="Subtotal" value={formatCurrency(quote.subtotal)} />
          <Row label="Entrega" value={quote.deliveryFee === 0 ? "Grátis" : formatCurrency(quote.deliveryFee)} />
          <Row label="Total" value={formatCurrency(quote.total)} bold />
          <Row label="Pagamento" value={PAYMENT_LABELS[quote.paymentMethod]} muted />
        </div>

        {quote.orderNotes && (
          <div className="rounded-xl bg-card p-3 shadow-card">
            <p className="text-xs font-semibold text-muted">Observações</p>
            <p className="mt-1 text-sm text-chocolate">{quote.orderNotes}</p>
          </div>
        )}

        {quote.editable ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDecisionModal("RECUSADO")}
              className="flex-1 rounded-xl border border-rose/40 py-3 text-sm font-semibold text-rose transition-colors hover:bg-rose/10"
            >
              Recusar
            </button>
            <button
              type="button"
              onClick={() => setDecisionModal("APROVADO")}
              className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90"
            >
              Aprovar orçamento
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-card p-4 text-center shadow-card">
            <p className="text-sm text-chocolate">
              Este orçamento já foi <strong>{QUOTE_STATUS_LABELS[quote.quoteStatus].toLowerCase()}</strong> e não pode
              mais ser alterado.
            </p>
          </div>
        )}
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
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${bold ? "mt-1 border-t border-sand pt-1 font-semibold" : ""} ${muted ? "text-muted" : "text-chocolate"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-app rounded-t-2xl bg-card p-5 shadow-card md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-chocolate">
          {isApprove ? "Confirmar aprovação do orçamento" : "Confirmar recusa do orçamento"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Por segurança, digite os 4 últimos dígitos do seu telefone ou CNPJ cadastrado.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          className={`input-field mt-3 ${error ? "border-rose" : ""}`}
          placeholder="0000"
          value={last4}
          onChange={(e) => {
            setLast4(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(null);
          }}
          disabled={submitting}
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-rose">{error}</p>}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 ${
              isApprove ? "bg-chocolate hover:bg-chocolate/90" : "bg-rose hover:bg-rose/90"
            }`}
          >
            {submitting ? "Enviando…" : isApprove ? "Confirmar aprovação" : "Confirmar recusa"}
          </button>
        </div>
      </div>
    </div>
  );
}
