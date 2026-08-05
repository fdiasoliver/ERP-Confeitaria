"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { formatCurrency } from "@/lib/formatters/currency";
import * as customerApi from "@/lib/api/customerApi";
import type { CustomerListItem } from "@/lib/api/customerApi";

const PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);

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
        orderBy: "name",
        orderDirection: "asc",
      });
      setCustomers(result.items);
      setTotal(result.total);
      hasLoadedOnce.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Toda mudança de busca/página refaz o fetch — nunca filtra em memória (busca server-side).
  useEffect(() => {
    loadCustomers(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [page, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasActiveFilter = searchInput.trim() !== "";

  return (
    <PageContainer>
      <HeaderMinimal title="Clientes" />

      <div className="space-y-4 p-5">
        <p className="text-sm text-muted">
          {loading ? "Carregando…" : `${total} cliente${total !== 1 ? "s" : ""}`}
        </p>

        {!error && (
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Pesquisar por nome ou telefone…"
            ariaLabel="Pesquisar cliente por nome ou telefone"
          />
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
            <ResponsiveGrid cols={3}>
              {customers.map((customer) => (
                <EntityCard
                  key={customer.id}
                  href={`/admin/clientes/${customer.id}`}
                  title={customer.name}
                  actions={
                    <Link
                      href={`/admin/clientes/${customer.id}`}
                      className="flex flex-1 items-center justify-center rounded-xl border border-sand py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60"
                    >
                      Ver perfil
                    </Link>
                  }
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
    </PageContainer>
  );
}
