"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { StatCard } from "@/components/admin/shared/StatCard";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { STATUS_LABELS, PAYMENT_LABELS } from "@/lib/types";
import type { PaymentStatus } from "@/lib/types";
import * as customerApi from "@/lib/api/customerApi";
import { ApiRequestError, CUSTOMER_TYPE_LABELS } from "@/lib/api/customerApi";
import type { CustomerDetail, Address } from "@/lib/api/customerApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface AddressForm {
  label: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}
const EMPTY_ADDRESS_FORM: AddressForm = {
  label: "", street: "", number: "", complement: "", neighborhood: "", city: "São Paulo", state: "SP", zipCode: "",
};

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

// Mesmo padrão de modal bottom-sheet de RecipeEditModal/AddItemModal em
// admin/receitas/[id]/page.tsx — mesmo conjunto de campos do endereço já usado
// no checkout público e no formulário de "Novo orçamento" (admin/orcamentos).
function AddressModal({ mode, form, errors, submitting, onClose, onChange, onSubmit }: {
  mode: "create" | "edit";
  form: AddressForm;
  errors: Record<string, string>;
  submitting: boolean;
  onClose: () => void;
  onChange: <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white pb-8 pt-5 px-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-chocolate">
            {mode === "create" ? "Adicionar endereço" : "Editar endereço"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-muted text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <Field label="Rótulo (opcional)" htmlFor="addr-label">
            <input
              id="addr-label"
              className="input-field"
              value={form.label}
              onChange={(e) => onChange("label", e.target.value)}
              placeholder="Ex: Casa, Trabalho"
              maxLength={50}
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Rua" required htmlFor="addr-street" error={errors.street}>
                <input
                  id="addr-street"
                  className={`input-field ${errors.street ? "border-rose" : ""}`}
                  value={form.street}
                  onChange={(e) => onChange("street", e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </div>
            <Field label="Número" required htmlFor="addr-number" error={errors.number}>
              <input
                id="addr-number"
                className={`input-field ${errors.number ? "border-rose" : ""}`}
                value={form.number}
                onChange={(e) => onChange("number", e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Complemento (opcional)" htmlFor="addr-complement">
            <input
              id="addr-complement"
              className="input-field"
              value={form.complement}
              onChange={(e) => onChange("complement", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <Field label="Bairro" required htmlFor="addr-neighborhood" error={errors.neighborhood}>
            <input
              id="addr-neighborhood"
              className={`input-field ${errors.neighborhood ? "border-rose" : ""}`}
              value={form.neighborhood}
              onChange={(e) => onChange("neighborhood", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Cidade" required htmlFor="addr-city" error={errors.city}>
                <input
                  id="addr-city"
                  className={`input-field ${errors.city ? "border-rose" : ""}`}
                  value={form.city}
                  onChange={(e) => onChange("city", e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </div>
            <Field label="UF" required htmlFor="addr-state" error={errors.state}>
              <input
                id="addr-state"
                maxLength={2}
                className={`input-field ${errors.state ? "border-rose" : ""}`}
                value={form.state}
                onChange={(e) => onChange("state", e.target.value.toUpperCase())}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="CEP" required htmlFor="addr-zip" error={errors.zipCode}>
            <input
              id="addr-zip"
              className={`input-field ${errors.zipCode ? "border-rose" : ""}`}
              value={form.zipCode}
              onChange={(e) => onChange("zipCode", e.target.value)}
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-sand py-3 text-sm font-semibold text-chocolate disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-chocolate py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
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

  const [addressModal, setAddressModal] = useState<"create" | "edit" | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(EMPTY_ADDRESS_FORM);
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [confirmDeleteAddress, setConfirmDeleteAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

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

  // ── Endereços ────────────────────────────────────────────────────────────────

  function openAddAddress() {
    setAddressForm(EMPTY_ADDRESS_FORM);
    setAddressFormErrors({});
    setEditingAddressId(null);
    setAddressModal("create");
  }

  function openEditAddress(address: Address) {
    setAddressForm({
      label: address.label ?? "",
      street: address.street,
      number: address.number,
      complement: address.complement ?? "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
    setAddressFormErrors({});
    setEditingAddressId(address.id);
    setAddressModal("edit");
  }

  function closeAddressModal() {
    setAddressModal(null);
    setEditingAddressId(null);
    setAddressFormErrors({});
  }

  function setAddressField<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
    setAddressFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validateAddressForm(): boolean {
    const errs: Record<string, string> = {};
    if (!addressForm.street.trim()) errs.street = "Rua é obrigatória.";
    if (!addressForm.number.trim()) errs.number = "Número é obrigatório.";
    if (!addressForm.neighborhood.trim()) errs.neighborhood = "Bairro é obrigatório.";
    if (!addressForm.city.trim()) errs.city = "Cidade é obrigatória.";
    if (!addressForm.state.trim()) errs.state = "Estado é obrigatório.";
    if (!addressForm.zipCode.trim()) errs.zipCode = "CEP é obrigatório.";
    setAddressFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSaveAddress() {
    if (!validateAddressForm()) return;
    setSavingAddress(true);
    const toastId = toast.loading(addressModal === "create" ? "Adicionando endereço…" : "Salvando endereço…");
    try {
      const payload = {
        label: addressForm.label.trim() || null,
        street: addressForm.street.trim(),
        number: addressForm.number.trim(),
        complement: addressForm.complement.trim() || null,
        neighborhood: addressForm.neighborhood.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
      };
      if (addressModal === "create") {
        await customerApi.createCustomerAddress(id, payload);
        toast.success("Endereço adicionado.", { id: toastId });
      } else if (editingAddressId) {
        await customerApi.updateCustomerAddress(id, editingAddressId, payload);
        toast.success("Endereço atualizado.", { id: toastId });
      }
      closeAddressModal();
      await loadCustomer();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR") {
        const details = Array.isArray(err.details) ? (err.details as { field: string; message: string }[]) : [];
        const errs: Record<string, string> = {};
        details.forEach((d) => { errs[d.field] = d.message; });
        if (Object.keys(errs).length > 0) setAddressFormErrors(errs);
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar endereço.", { id: toastId });
      }
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleConfirmDeleteAddress() {
    if (!confirmDeleteAddress) return;
    const address = confirmDeleteAddress;
    setConfirmDeleteAddress(null);
    setDeletingAddress(true);
    const toastId = toast.loading("Excluindo endereço…");
    try {
      await customerApi.deleteCustomerAddress(id, address.id);
      toast.success("Endereço excluído.", { id: toastId });
      await loadCustomer();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "ADDRESS_IN_USE") {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir endereço.", { id: toastId });
      }
    } finally {
      setDeletingAddress(false);
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
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin/clientes" className="text-sm font-medium text-chocolate underline">
            ← Voltar para Clientes
          </Link>
          <Link
            href={`/admin/orcamentos?customerId=${customer.id}`}
            className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90"
          >
            + Novo orçamento
          </Link>
        </div>

        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold text-chocolate">{customer.name}</h1>
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-chocolate">
              {CUSTOMER_TYPE_LABELS[customer.type]}
            </span>
          </div>
          <p className="mb-4 text-sm text-muted">
            Cliente desde {formatDateTime(customer.createdAt)}
          </p>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Telefone</p>
              <p className="input-field bg-sand/40 text-chocolate">{customer.phone ?? "Não informado"}</p>
              <p className="mt-1 text-[11px] text-muted">
                {customer.type === "CONSUMIDOR_FINAL"
                  ? "Somente leitura — chave de login do cliente."
                  : "Somente leitura."}
              </p>
            </div>
            {customer.email && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">E-mail</p>
                <p className="input-field bg-sand/40 text-chocolate">{customer.email}</p>
              </div>
            )}
            {customer.type === "CORPORATIVO" && customer.cnpj && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">CNPJ</p>
                <p className="input-field bg-sand/40 text-chocolate">{customer.cnpj}</p>
              </div>
            )}
            {customer.type === "CORPORATIVO" && customer.companyName && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Razão social</p>
                <p className="input-field bg-sand/40 text-chocolate">{customer.companyName}</p>
              </div>
            )}
            {customer.type === "CORPORATIVO" && customer.tradeName && (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">Nome fantasia</p>
                <p className="input-field bg-sand/40 text-chocolate">{customer.tradeName}</p>
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
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-chocolate">Endereços ({customer.addressGroups.length})</p>
            <button
              type="button"
              onClick={openAddAddress}
              className="text-sm font-semibold text-chocolate underline"
            >
              + Adicionar endereço
            </button>
          </div>
          {customer.addressGroups.length === 0 ? (
            <EmptyState
              title="Nenhum endereço registrado"
              description="Adicione um endereço acima, ou aguarde o primeiro pedido com entrega."
              actionLabel="+ Adicionar endereço"
              onAction={openAddAddress}
            />
          ) : (
            <div className="space-y-3">
              {customer.addressGroups.map((group) => {
                const orderCount = customer.orders.filter(
                  (order) => order.addressId !== null && group.addressIds.includes(order.addressId),
                ).length;
                return (
                  <div key={group.representative.id} className="shadow-card rounded-2xl bg-white p-4">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {group.representative.label && (
                          <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-chocolate">
                            {group.representative.label}
                          </span>
                        )}
                        <p className="font-semibold text-chocolate">
                          {group.representative.street}, {group.representative.number}
                        </p>
                        {group.representative.isDefault && (
                          <span className="rounded-full bg-sage/10 px-2 py-0.5 text-xs font-semibold text-sage">Padrão</span>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => openEditAddress(group.representative)}
                          disabled={deletingAddress}
                          aria-label={`Editar endereço ${group.representative.street}, ${group.representative.number}`}
                          className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-chocolate disabled:opacity-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAddress(group.representative)}
                          disabled={deletingAddress}
                          aria-label={`Excluir endereço ${group.representative.street}, ${group.representative.number}`}
                          className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-rose disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
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

      {addressModal && (
        <AddressModal
          mode={addressModal}
          form={addressForm}
          errors={addressFormErrors}
          submitting={savingAddress}
          onClose={closeAddressModal}
          onChange={setAddressField}
          onSubmit={handleSaveAddress}
        />
      )}

      {confirmDeleteAddress && (
        <ConfirmDialog
          title="Excluir endereço?"
          description={
            <>
              <strong className="text-chocolate">
                {confirmDeleteAddress.street}, {confirmDeleteAddress.number}
              </strong>{" "}
              será excluído permanentemente. Endereços usados em algum pedido não podem ser excluídos.
            </>
          }
          cancelLabel="Manter endereço"
          confirmLabel="Excluir"
          busy={deletingAddress}
          onCancel={() => setConfirmDeleteAddress(null)}
          onConfirm={handleConfirmDeleteAddress}
        />
      )}
    </PageContainer>
  );
}
