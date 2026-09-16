"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
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
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { formatCurrency } from "@/lib/formatters/currency";
import * as customerApi from "@/lib/api/customerApi";
import { ApiRequestError, type CustomerListItem } from "@/lib/api/customerApi";

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
      render: (c) => <span className="text-muted">{c.phone}</span>,
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
          {!loading && !error && <ViewToggle value={view} onChange={setView} />}
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
                    <p className="text-xs text-muted">{customer.phone}</p>
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
