"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { FilterChips } from "@/components/admin/shared/FilterChips";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { formatCurrency } from "@/lib/formatters/currency";
import type { ValidationError } from "@/lib/types";
import * as customerApi from "@/lib/api/customerApi";
import {
  ApiRequestError,
  CUSTOMER_TYPE_LABELS,
  type CustomerListItem,
  type CustomerType,
} from "@/lib/api/customerApi";

// ── Formulário "Novo cliente" ───────────────────────────────────────────────

interface CustomerForm {
  name: string;
  type: CustomerType;
  phone: string;
  cnpj: string;
  companyName: string;
  tradeName: string;
  email: string;
}

const EMPTY_CUSTOMER_FORM: CustomerForm = {
  name: "",
  type: "CONSUMIDOR_FINAL",
  phone: "",
  cnpj: "",
  companyName: "",
  tradeName: "",
  email: "",
};

const PAGE_SIZE = 12;

type StatusFilter = "all" | "active" | "inactive";

interface ConfirmAction {
  type: "deactivate" | "delete";
  customer: CustomerListItem;
}

// `Customer.createdAt`/`lastOrderAt` são DateTime completos — mesma formatação
// local já usada em admin/embalagens/[id]/page.tsx (formatDate de
// src/lib/formatters/date.ts assume string só de data, não se aplica aqui).
function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ClientesAdminPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("clientes");

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [modal, setModal] = useState<"create" | null>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY_CUSTOMER_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const hasLoadedOnce = useRef(false);

  // Debounce da pesquisa (~300ms) — busca é server-side, evita um fetch por caractere digitado.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadCustomers(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await customerApi.listCustomers({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        orderBy: "name",
        orderDirection: "asc",
      });
      setCustomers(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de clientes.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar clientes.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Toda mudança de busca/filtro/página refaz o fetch — nunca filtra em memória (busca server-side).
  useEffect(() => {
    loadCustomers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "" || statusFilter !== "all";

  function handleStatusFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  // ── Ativar/Desativar/Excluir ────────────────────────────────────────────────

  async function handleActivate(customer: CustomerListItem) {
    setActionLoading(customer.id);
    const toastId = toast.loading("Ativando cliente…");
    try {
      await customerApi.activateCustomer(customer.id);
      toast.success(`"${customer.name}" ativado com sucesso.`, { id: toastId });
      await loadCustomers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar cliente.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConfirmAction() {
    if (!confirmAction) return;
    const { type, customer } = confirmAction;
    setConfirmAction(null);
    setActionLoading(customer.id);
    const toastId = toast.loading(type === "deactivate" ? "Desativando cliente…" : "Excluindo cliente…");
    try {
      if (type === "deactivate") {
        await customerApi.deactivateCustomer(customer.id);
        toast.success(`"${customer.name}" desativado.`, { id: toastId });
      } else {
        await customerApi.deleteCustomer(customer.id);
        toast.success(`"${customer.name}" excluído.`, { id: toastId });
      }
      await loadCustomers();
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "CUSTOMER_IN_USE") {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao processar a ação.", { id: toastId });
      }
    } finally {
      setActionLoading(null);
    }
  }

  // ── Formulário de criação ("Novo cliente") ─────────────────────────────────

  function openCreate() {
    setForm(EMPTY_CUSTOMER_FORM);
    setFormErrors({});
    setModal("create");
  }

  function closeModal() { setModal(null); setFormErrors({}); }

  function setField<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  // Mesmas regras de customerValidator.ts (validateCustomerCreate) — duplicação
  // deliberada e aceita (skill frontend-pattern 4.9): o backend é sempre a fonte
  // de verdade final, applyServerValidationErrors sobrescreve estes erros locais.
  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = "Nome é obrigatório.";

    const phone = form.phone.trim();
    const cnpj = form.cnpj.trim();
    const companyName = form.companyName.trim();

    if (form.type === "CONSUMIDOR_FINAL") {
      if (!phone) errs.phone = "Telefone é obrigatório para consumidor final.";
    } else {
      if (!phone && !cnpj) errs.phone = "Informe ao menos telefone ou CNPJ para cliente corporativo.";
      if (!companyName) errs.companyName = "Razão social é obrigatória para cliente corporativo.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function applyServerValidationErrors(details: unknown) {
    if (!Array.isArray(details)) return false;
    const errs: Record<string, string> = {};
    (details as ValidationError[]).forEach((e) => { errs[e.field] = e.message; });
    if (Object.keys(errs).length === 0) return false;
    setFormErrors(errs);
    return true;
  }

  async function handleCreateSubmit() {
    if (!validateForm()) return;
    setSubmitting(true);
    const toastId = toast.loading("Criando cliente…");
    try {
      await customerApi.createCustomer({
        name: form.name.trim(),
        type: form.type,
        phone: form.phone.trim() === "" ? null : form.phone.trim(),
        cnpj: form.type === "CORPORATIVO" && form.cnpj.trim() !== "" ? form.cnpj.trim() : null,
        companyName: form.type === "CORPORATIVO" && form.companyName.trim() !== "" ? form.companyName.trim() : null,
        tradeName: form.type === "CORPORATIVO" && form.tradeName.trim() !== "" ? form.tradeName.trim() : null,
        email: form.email.trim() === "" ? null : form.email.trim(),
      });
      toast.success("Cliente criado com sucesso.", { id: toastId });
      closeModal();
      await loadCustomers(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "CUSTOMER_DUPLICATE_PHONE") {
        setFormErrors({ phone: err.message });
        toast.error(err.message, { id: toastId });
      } else if (err instanceof ApiRequestError && err.code === "CUSTOMER_DUPLICATE_CNPJ") {
        setFormErrors({ cnpj: err.message });
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao criar cliente.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const columns: EntityColumn<CustomerListItem>[] = [
    {
      key: "name",
      header: "Nome",
      render: (c) => <span className="font-semibold text-chocolate">{c.name}</span>,
    },
    {
      key: "phone",
      header: "Telefone",
      className: "hidden md:table-cell",
      render: (c) => <span className="text-muted">{c.phone ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge isActive={c.active} />,
    },
    {
      key: "ltv",
      header: "LTV",
      className: "text-right",
      render: (c) => <span className="font-semibold text-chocolate">{formatCurrency(c.ltv)}</span>,
    },
    {
      key: "lastOrder",
      header: "Último pedido",
      className: "hidden text-right sm:table-cell",
      render: (c) => <span className="text-muted">{c.lastOrderAt ? formatDateTime(c.lastOrderAt) : "—"}</span>,
    },
  ];

  function renderCustomerActions(customer: CustomerListItem, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold"
        : "flex shrink-0 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const neutral = "border border-sand transition-colors hover:bg-sand/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50";
    const busy = actionLoading === customer.id;
    return (
      <>
        <Link
          href={`/admin/clientes/${customer.id}`}
          className={`${base} ${neutral} text-chocolate`}
        >
          Ver perfil
        </Link>
        {customer.active ? (
          <button
            type="button"
            onClick={() => setConfirmAction({ type: "deactivate", customer })}
            disabled={busy}
            aria-label={`Desativar cliente ${customer.name}`}
            className={`${base} ${neutral} text-muted`}
          >
            {busy ? "…" : "Desativar"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleActivate(customer)}
            disabled={busy}
            aria-label={`Ativar cliente ${customer.name}`}
            className={`${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`}
          >
            {busy ? "…" : "Ativar"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmAction({ type: "delete", customer })}
          disabled={busy}
          aria-label={`Excluir cliente ${customer.name}`}
          className={`${variant === "card" ? "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm" : "flex shrink-0 items-center rounded-lg px-3 py-1.5 text-xs"} border border-rose/40 font-semibold text-rose transition-colors hover:bg-rose/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50`}
        >
          Excluir
        </button>
      </>
    );
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Clientes" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Carregando…" : `${total} cliente${total !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            {!loading && !error && <ViewToggle value={view} onChange={setView} />}
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
            >
              + Novo cliente
            </button>
          </div>
        </div>

        {!error && (
          <div className="space-y-3">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Pesquisar por nome ou telefone…"
              ariaLabel="Pesquisar cliente por nome ou telefone"
            />

            <FilterChips
              label="Status"
              selected={statusFilter}
              onSelect={handleStatusFilterChange}
              options={[
                { value: "all", label: "Todos" },
                { value: "active", label: "Ativos" },
                { value: "inactive", label: "Inativos" },
              ]}
            />
          </div>
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadCustomers(false)} />}
        {!loading && !error && customers.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa para ver todos os clientes."
                : "Clientes aparecem aqui automaticamente após o primeiro pedido feito pelo checkout."
            }
          />
        )}
        {!loading && !error && customers.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {customers.map((customer) => (
                  <EntityCard
                    key={customer.id}
                    href={`/admin/clientes/${customer.id}`}
                    title={customer.name}
                    badges={<StatusBadge isActive={customer.active} />}
                    actions={renderCustomerActions(customer, "card")}
                  >
                    <p className="text-xs text-muted">{customer.phone ?? "Sem telefone"}</p>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                        <p className="text-sm font-semibold leading-none text-chocolate">{formatCurrency(customer.ltv)}</p>
                        <p className="mt-0.5 text-[10px] text-muted">LTV</p>
                      </div>
                      <div className="rounded-lg bg-sand/60 px-2 py-1.5">
                        <p className="text-sm font-semibold leading-none text-chocolate">
                          {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {customer.lastOrderAt ? "Último pedido" : "Nenhum pedido ainda"}
                        </p>
                      </div>
                    </div>
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable
                items={customers}
                columns={columns}
                getKey={(c) => c.id}
                renderActions={(c) => renderCustomerActions(c, "row")}
              />
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
                >
                  ‹ Anterior
                </button>
                <p className="text-xs text-muted">Página {page} de {totalPages}</p>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate disabled:opacity-50"
                >
                  Próxima ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <EntityForm
          title="Novo cliente"
          submitting={submitting}
          submitLabel="Criar"
          onClose={closeModal}
          onSubmit={handleCreateSubmit}
        >
          <Field label="Tipo de cliente" required htmlFor="customer-type">
            <select
              id="customer-type"
              className="input-field"
              value={form.type}
              onChange={(e) => setField("type", e.target.value as CustomerType)}
              disabled={submitting}
            >
              <option value="CONSUMIDOR_FINAL">{CUSTOMER_TYPE_LABELS.CONSUMIDOR_FINAL}</option>
              <option value="CORPORATIVO">{CUSTOMER_TYPE_LABELS.CORPORATIVO}</option>
            </select>
          </Field>

          <Field label="Nome" required htmlFor="customer-name" error={formErrors.name}>
            <input
              id="customer-name"
              className={`input-field ${formErrors.name ? "border-rose" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder={form.type === "CORPORATIVO" ? "Nome do contato" : "Ex: Maria Silva"}
              disabled={submitting}
            />
          </Field>

          <Field
            label={form.type === "CORPORATIVO" ? "Telefone (opcional se houver CNPJ)" : "Telefone"}
            required={form.type === "CONSUMIDOR_FINAL"}
            htmlFor="customer-phone"
            error={formErrors.phone}
          >
            <input
              id="customer-phone"
              className={`input-field ${formErrors.phone ? "border-rose" : ""}`}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="Ex: 11999998888"
              disabled={submitting}
            />
          </Field>

          {form.type === "CORPORATIVO" && (
            <>
              <Field label="CNPJ (opcional se houver telefone)" htmlFor="customer-cnpj" error={formErrors.cnpj}>
                <input
                  id="customer-cnpj"
                  className={`input-field ${formErrors.cnpj ? "border-rose" : ""}`}
                  value={form.cnpj}
                  onChange={(e) => setField("cnpj", e.target.value)}
                  placeholder="Ex: 12345678000199"
                  disabled={submitting}
                />
              </Field>
              <Field label="Razão social" required htmlFor="customer-company-name" error={formErrors.companyName}>
                <input
                  id="customer-company-name"
                  className={`input-field ${formErrors.companyName ? "border-rose" : ""}`}
                  value={form.companyName}
                  onChange={(e) => setField("companyName", e.target.value)}
                  placeholder="Ex: Doce Menina Eventos LTDA"
                  disabled={submitting}
                />
              </Field>
              <Field label="Nome fantasia (opcional)" htmlFor="customer-trade-name">
                <input
                  id="customer-trade-name"
                  className="input-field"
                  value={form.tradeName}
                  onChange={(e) => setField("tradeName", e.target.value)}
                  placeholder="Ex: Doce Menina Eventos"
                  disabled={submitting}
                />
              </Field>
            </>
          )}

          <Field label="E-mail (opcional)" htmlFor="customer-email">
            <input
              id="customer-email"
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="Ex: contato@empresa.com.br"
              disabled={submitting}
            />
          </Field>
        </EntityForm>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === "delete" ? "Excluir cliente?" : "Desativar cliente?"}
          description={
            confirmAction.type === "delete" ? (
              <>
                <strong className="text-chocolate">{confirmAction.customer.name}</strong> será excluído permanentemente.
                Se ele já tiver algum pedido, a exclusão será bloqueada.
              </>
            ) : (
              <>
                <strong className="text-chocolate">{confirmAction.customer.name}</strong> deixará de aparecer nas telas
                operacionais ativas, mas o histórico de pedidos é preservado. Ele pode ser reativado a qualquer momento.
              </>
            )
          }
          cancelLabel="Cancelar"
          confirmLabel={confirmAction.type === "delete" ? "Excluir" : "Desativar"}
          busy={actionLoading === confirmAction.customer.id}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </PageContainer>
  );
}
