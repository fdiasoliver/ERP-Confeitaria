"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatCard } from "@/components/admin/shared/StatCard";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/types";
import type { PaymentStatus } from "@/lib/types";
import * as customerApi from "@/lib/api/customerApi";
import { ApiRequestError } from "@/lib/api/customerApi";
import type { CustomerDetail } from "@/lib/api/customerApi";

const MAX_NOTES_LENGTH = 2000;

// Sem dicionário compartilhado para PaymentStatus em src/lib/types.ts (só
// DeliveryType/PaymentMethod/OrderStatus têm — STATUS_LABELS/PAYMENT_LABELS) —
// dicionário local, mesmo padrão de label dictionary já usado no restante do projeto.
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  PARCIAL: "Parcial",
  ESTORNADO: "Estornado",
};

// `Customer.createdAt`/`Order.createdAt` são DateTime completos — mesma formatação
// local já usada em admin/embalagens/[id]/page.tsx (formatDate de
// src/lib/formatters/date.ts assume string só de data, não se aplica aqui).
function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="shadow-card h-36 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-40 animate-pulse rounded-2xl bg-white" />
      <div className="shadow-card h-24 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  async function loadCustomer() {
    setLoading(true);
    setError(null);
    try {
      const row = await customerApi.getCustomer(id);
      setCustomer(row);
      setNotesInput(row.notes ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cliente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCustomer(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  const notesChanged = customer !== null && notesInput !== (customer.notes ?? "");
  const notesTooLong = notesInput.length > MAX_NOTES_LENGTH;

  async function handleSaveNotes() {
    if (!customer || notesTooLong) return;
    setSavingNotes(true);
    const toastId = toast.loading("Salvando observações…");
    try {
      const updated = await customerApi.updateCustomerNotes(id, notesInput.trim() === "" ? null : notesInput);
      setCustomer((prev) => (prev ? { ...prev, notes: updated.notes } : prev));
      setNotesInput(updated.notes ?? "");
      toast.success("Observações salvas.", { id: toastId });
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR") {
        const details = Array.isArray(err.details) ? (err.details as { message: string }[]) : [];
        toast.error(details[0]?.message ?? err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar observações.", { id: toastId });
      }
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <HeaderMinimal title="Cliente" />
        <div className="p-5"><LoadingState /></div>
      </PageContainer>
    );
  }

  if (error || !customer) {
    return (
      <PageContainer>
        <HeaderMinimal title="Cliente" />
        <div className="p-5">
          <ErrorState message={error ?? "Cliente não encontrado."} onRetry={loadCustomer} />
        </div>
      </PageContainer>
    );
  }

  const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <PageContainer>
      <HeaderMinimal title="Cliente" />

      <div className="space-y-4 p-5">
        <Link href="/admin/clientes" className="text-sm font-medium text-chocolate underline">
          ← Voltar para Clientes
        </Link>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <h1 className="font-display mb-1 text-xl font-semibold text-chocolate">{customer.name}</h1>
          <p className="mb-4 text-sm text-muted">
            Cliente desde {formatDateTime(customer.createdAt)}
          </p>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Telefone</p>
              <p className="input-field bg-sand/40 text-chocolate">{customer.phone}</p>
              <p className="mt-1 text-[11px] text-muted">Somente leitura — chave de login do cliente.</p>
            </div>
            {customer.email && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">E-mail</p>
                <p className="input-field bg-sand/40 text-chocolate">{customer.email}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard value={formatCurrency(totalSpent)} label="Total gasto (LTV)" />
            <StatCard value={customer.orders.length} label={`Pedido${customer.orders.length !== 1 ? "s" : ""}`} />
          </div>
        </div>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <h2 className="font-display mb-3 text-base font-semibold text-chocolate">Observações internas</h2>
          <textarea
            className="input-field"
            rows={4}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder="Preferências, restrições, observações da equipe sobre este cliente…"
            disabled={savingNotes}
            aria-label="Observações internas do cliente"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-xs ${notesTooLong ? "text-rose" : "text-muted"}`}>
              {notesInput.length}/{MAX_NOTES_LENGTH}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={!notesChanged || notesTooLong || savingNotes}
            className="mt-3 rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 disabled:opacity-50"
          >
            {savingNotes ? "Salvando…" : "Salvar observações"}
          </button>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Endereços ({customer.addressGroups.length})</p>
          {customer.addressGroups.length === 0 ? (
            <EmptyState
              title="Nenhum endereço registrado"
              description="Endereços aparecem aqui após o primeiro pedido com entrega."
            />
          ) : (
            <div className="space-y-3">
              {customer.addressGroups.map((group) => {
                const orderCount = customer.orders.filter(
                  (order) => order.addressId !== null && group.addressIds.includes(order.addressId),
                ).length;
                return (
                  <div key={group.representative.id} className="shadow-card rounded-2xl bg-white p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-chocolate">
                        {group.representative.street}, {group.representative.number}
                      </p>
                      {group.representative.isDefault && (
                        <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-semibold text-sage">Padrão</span>
                      )}
                    </div>
                    {group.representative.complement && (
                      <p className="text-sm text-muted">{group.representative.complement}</p>
                    )}
                    <p className="text-sm text-muted">
                      {group.representative.neighborhood} · {group.representative.city}/{group.representative.state} · {group.representative.zipCode}
                    </p>
                    {orderCount > 0 && (
                      <p className="mt-1 text-[11px] text-muted">
                        Usado em {orderCount} pedido{orderCount !== 1 ? "s" : ""}
                        {group.addressIds.length > 1 ? ` (${group.addressIds.length} registros equivalentes agrupados)` : ""}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-chocolate">Histórico de pedidos ({customer.orders.length})</p>
          {customer.orders.length === 0 ? (
            <EmptyState title="Nenhum pedido ainda" description="Os pedidos deste cliente aparecerão aqui." />
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order) => (
                <div key={order.id} className="shadow-card rounded-2xl bg-white p-4">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-chocolate">Pedido #{order.orderNumber}</p>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-chocolate">
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted">
                    Entrega em {formatDate(order.deliveryDate)} · {PAYMENT_LABELS[order.paymentMethod]} ({PAYMENT_STATUS_LABELS[order.paymentStatus]})
                  </p>
                  <p className="mt-1 text-sm font-semibold text-chocolate">{formatCurrency(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
