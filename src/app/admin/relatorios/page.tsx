"use client";

import { useState, useEffect } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { StatCard } from "@/components/admin/shared/StatCard";
import { BarChart } from "@/components/admin/shared/BarChart";
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { FilterChips } from "@/components/admin/shared/FilterChips";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { formatCurrency } from "@/lib/formatters/currency";
import { PAYMENT_LABELS, type PaymentMethod } from "@/lib/types";
import * as reportsApi from "@/lib/api/reportsApi";
import {
  ApiRequestError,
  type FinancialReportDTO,
  type CategoryBreakdownDTO,
  type PaymentMethodBreakdownDTO,
  type RevenueBasis,
  type CostCenterReportDTO,
  type CostCenterBucketDTO,
  type CashFlowReportDTO,
  type DREReportDTO,
  type AccountsPayableReportDTO,
  type AccountsPayableItemDTO,
} from "@/lib/api/reportsApi";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/lib/api/expenseApi";

function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function paymentLabel(method: string): string {
  return PAYMENT_LABELS[method as PaymentMethod] ?? method;
}

// CSV simples via Blob — sem dependência nova (planejamento do P3.2: PDF usa
// impressão do navegador, não uma lib de geração de PDF).
function downloadCSV(filename: string, header: string[], rows: (string | number)[][]) {
  const lines = [header, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
  );
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const BASIS_OPTIONS: { value: RevenueBasis; label: string }[] = [
  { value: "entregue", label: "Pedidos entregues" },
  { value: "pago", label: "Pedidos pagos" },
];

// Mesmo padrão de src/app/admin/despesas/page.tsx (formatShortDate) — data
// curta (dd/mm/aaaa), distinta de formatDate (long, com dia da semana).
function formatShortDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isOverdue(iso: string): boolean {
  const due = new Date(`${iso}T12:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return due < startOfToday;
}

function DRELine({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${emphasis ? "font-semibold text-chocolate" : "text-sm text-muted"}`}>
      <dt>{label}</dt>
      <dd className={value < 0 ? "text-rose" : emphasis ? "text-chocolate" : ""}>{formatCurrency(value)}</dd>
    </div>
  );
}

export default function RelatoriosAdminPage() {
  const [startDate, setStartDate] = useState(toDateParam(firstDayOfMonth()));
  const [endDate, setEndDate] = useState(toDateParam(new Date()));
  const [basis, setBasis] = useState<RevenueBasis>("entregue");
  const [report, setReport] = useState<FinancialReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [costCenterReport, setCostCenterReport] = useState<CostCenterReportDTO | null>(null);
  const [costCenterLoading, setCostCenterLoading] = useState(true);
  const [costCenterError, setCostCenterError] = useState<string | null>(null);

  const [cashFlowReport, setCashFlowReport] = useState<CashFlowReportDTO | null>(null);
  const [cashFlowLoading, setCashFlowLoading] = useState(true);
  const [cashFlowError, setCashFlowError] = useState<string | null>(null);

  const [dreReport, setDreReport] = useState<DREReportDTO | null>(null);
  const [dreLoading, setDreLoading] = useState(true);
  const [dreError, setDreError] = useState<string | null>(null);

  const [payableReport, setPayableReport] = useState<AccountsPayableReportDTO | null>(null);
  const [payableLoading, setPayableLoading] = useState(true);
  const [payableError, setPayableError] = useState<string | null>(null);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsApi.getFinancialReport(startDate, endDate, basis);
      setReport(result);
    } catch (err) {
      setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Erro ao carregar relatório.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCostCenterReport() {
    setCostCenterLoading(true);
    setCostCenterError(null);
    try {
      const result = await reportsApi.getCostCenterReport(startDate, endDate);
      setCostCenterReport(result);
    } catch (err) {
      setCostCenterError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Erro ao carregar centro de custo.");
    } finally {
      setCostCenterLoading(false);
    }
  }

  async function loadCashFlowReport() {
    setCashFlowLoading(true);
    setCashFlowError(null);
    try {
      const result = await reportsApi.getCashFlowReport(startDate, endDate, basis);
      setCashFlowReport(result);
    } catch (err) {
      setCashFlowError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Erro ao carregar fluxo de caixa.");
    } finally {
      setCashFlowLoading(false);
    }
  }

  async function loadDREReport() {
    setDreLoading(true);
    setDreError(null);
    try {
      const result = await reportsApi.getDREReport(startDate, endDate, basis);
      setDreReport(result);
    } catch (err) {
      setDreError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Erro ao carregar DRE.");
    } finally {
      setDreLoading(false);
    }
  }

  async function loadPayableReport() {
    setPayableLoading(true);
    setPayableError(null);
    try {
      const result = await reportsApi.getAccountsPayableReport();
      setPayableReport(result);
    } catch (err) {
      setPayableError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Erro ao carregar contas a pagar.");
    } finally {
      setPayableLoading(false);
    }
  }

  useEffect(() => {
    loadReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [startDate, endDate, basis]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCostCenterReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [startDate, endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCashFlowReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [startDate, endDate, basis]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadDREReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [startDate, endDate, basis]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadPayableReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const categoryColumns: EntityColumn<CategoryBreakdownDTO>[] = [
    { key: "categoryName", header: "Categoria", render: (c) => <span className="font-semibold text-chocolate">{c.categoryName}</span> },
    { key: "revenue", header: "Receita", className: "text-right", render: (c) => formatCurrency(c.revenue) },
    { key: "cost", header: "Custo", className: "hidden text-right sm:table-cell", render: (c) => <span className="text-muted">{formatCurrency(c.cost)}</span> },
    { key: "margin", header: "Margem", className: "text-right", render: (c) => `${(c.margin * 100).toFixed(0)}%` },
    { key: "quantity", header: "Qtd.", className: "hidden text-right md:table-cell", render: (c) => <span className="text-muted">{c.quantity}</span> },
  ];

  const paymentColumns: EntityColumn<PaymentMethodBreakdownDTO>[] = [
    { key: "method", header: "Método", render: (p) => <span className="font-semibold text-chocolate">{paymentLabel(p.paymentMethod)}</span> },
    { key: "count", header: "Pedidos", className: "text-right", render: (p) => p.count },
    { key: "total", header: "Valor", className: "text-right", render: (p) => formatCurrency(p.total) },
  ];

  const costCenterColumns: EntityColumn<CostCenterBucketDTO>[] = [
    { key: "label", header: "Nome", render: (b) => <span className="font-semibold text-chocolate">{b.label}</span> },
    { key: "total", header: "Total", className: "text-right", render: (b) => formatCurrency(b.total) },
  ];

  const payableColumns: EntityColumn<AccountsPayableItemDTO>[] = [
    { key: "description", header: "Descrição", render: (i) => <span className="font-semibold text-chocolate">{i.description}</span> },
    {
      key: "dueDate",
      header: "Vencimento",
      className: "text-right",
      render: (i) =>
        i.dueDate ? (
          <span className={isOverdue(i.dueDate) ? "font-semibold text-rose" : "text-muted"}>{formatShortDate(i.dueDate)}</span>
        ) : (
          <span className="text-muted">Sem vencimento</span>
        ),
    },
    { key: "amount", header: "Valor", className: "text-right", render: (i) => formatCurrency(i.amount) },
  ];

  // Agrupa os itens (já ordenados por vencimento, mais próximo primeiro, sem
  // vencimento no fim — ver getAccountsPayableSummary) por categoria, na ordem
  // de `byCategory` (maior total primeiro).
  const payableByCategory = payableReport
    ? payableReport.byCategory.map((bucket) => ({
        category: bucket.category,
        total: bucket.total,
        items: payableReport.items.filter((item) => item.category === bucket.category),
      }))
    : [];

  function exportCategoryCSV() {
    if (!report) return;
    downloadCSV(
      `relatorio-categorias_${startDate}_${endDate}.csv`,
      ["Categoria", "Receita", "Custo", "Margem", "Quantidade"],
      report.byCategory.map((c) => [c.categoryName, c.revenue.toFixed(2), c.cost.toFixed(2), `${(c.margin * 100).toFixed(1)}%`, c.quantity]),
    );
  }

  function exportPaymentCSV() {
    if (!report) return;
    downloadCSV(
      `relatorio-pagamentos_${startDate}_${endDate}.csv`,
      ["Método", "Pedidos", "Valor"],
      report.byPaymentMethod.map((p) => [paymentLabel(p.paymentMethod), p.count, p.total.toFixed(2)]),
    );
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Relatórios financeiros" />

      <div className="space-y-4 p-5">
        <div className="print:hidden flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="report-start" className="mb-1.5 block text-xs font-medium text-muted">De</label>
              <input
                id="report-start"
                type="date"
                className="input-field"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="report-end" className="mb-1.5 block text-xs font-medium text-muted">Até</label>
              <input
                id="report-end"
                type="date"
                className="input-field"
                value={endDate}
                min={startDate}
                max={toDateParam(new Date())}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!report}
            className="rounded-xl border border-sand px-4 py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-sand/60 disabled:opacity-50"
          >
            Exportar PDF
          </button>
        </div>

        <div className="print:hidden">
          <FilterChips label="Critério de faturamento" selected={basis} onSelect={setBasis} options={BASIS_OPTIONS} />
        </div>

        {loading && <LoadingState count={4} />}
        {!loading && error && <ErrorState message={error} onRetry={loadReport} />}

        {!loading && !error && report && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard value={formatCurrency(report.revenue)} label="Faturamento" note={`${report.orderCount} pedido${report.orderCount !== 1 ? "s" : ""}`} />
              <StatCard value={formatCurrency(report.averageTicket)} label="Ticket médio" />
              <StatCard value={formatCurrency(report.cmv)} label="CMV" note="Sempre pedidos entregues" />
              <StatCard value={`${(report.grossMargin * 100).toFixed(0)}%`} label="Margem bruta" note={basis === "pago" ? "Receita paga × custo entregue" : undefined} />
            </div>

            {report.byCategory.length > 0 && (
              <div className="shadow-card rounded-2xl border border-sand bg-card p-4">
                <h2 className="font-display mb-3 text-base font-semibold text-chocolate">Faturamento por categoria</h2>
                <BarChart data={report.byCategory.map((c) => ({ label: c.categoryName, value: c.revenue }))} />
              </div>
            )}

            <div>
              <div className="print:hidden mb-2 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-chocolate">Por categoria</h2>
                <button type="button" onClick={exportCategoryCSV} className="text-sm font-semibold text-chocolate underline">
                  Exportar CSV
                </button>
              </div>
              {report.byCategory.length === 0 ? (
                <EmptyState title="Nenhum dado no período" description="Ajuste o filtro de datas ou o critério de faturamento." />
              ) : (
                <EntityTable items={report.byCategory} columns={categoryColumns} getKey={(c) => c.categoryName} />
              )}
            </div>

            <div>
              <div className="print:hidden mb-2 flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-chocolate">Por método de pagamento</h2>
                <button type="button" onClick={exportPaymentCSV} className="text-sm font-semibold text-chocolate underline">
                  Exportar CSV
                </button>
              </div>
              {report.byPaymentMethod.length === 0 ? (
                <EmptyState title="Nenhum dado no período" description="Ajuste o filtro de datas ou o critério de faturamento." />
              ) : (
                <EntityTable items={report.byPaymentMethod} columns={paymentColumns} getKey={(p) => p.paymentMethod} />
              )}
            </div>
          </>
        )}

        <h2 className="font-display text-base font-semibold text-chocolate">Centro de custo</h2>

        {costCenterLoading && <LoadingState count={2} />}
        {!costCenterLoading && costCenterError && <ErrorState message={costCenterError} onRetry={loadCostCenterReport} />}

        {!costCenterLoading && !costCenterError && costCenterReport && (
          <>
            <div>
              <h3 className="font-display mb-2 text-sm font-semibold text-chocolate">Despesas por canal de venda</h3>
              {costCenterReport.bySalesChannel.length === 0 ? (
                <EmptyState title="Nenhuma despesa paga no período" description="Ajuste o filtro de datas." />
              ) : (
                <EntityTable items={costCenterReport.bySalesChannel} columns={costCenterColumns} getKey={(b) => b.label} />
              )}
            </div>

            <div>
              <h3 className="font-display mb-2 text-sm font-semibold text-chocolate">Despesas por categoria de produto</h3>
              {costCenterReport.byProductCategory.length === 0 ? (
                <EmptyState title="Nenhuma despesa paga no período" description="Ajuste o filtro de datas." />
              ) : (
                <EntityTable items={costCenterReport.byProductCategory} columns={costCenterColumns} getKey={(b) => b.label} />
              )}
            </div>
          </>
        )}

        {/* ─── Fluxo de caixa (Sprint 3 — Épico 3) ────────────────────────── */}
        <div className="border-t border-sand pt-4">
          <h2 className="font-display text-base font-semibold text-chocolate">Fluxo de caixa</h2>
          <p className="mt-1 text-xs text-muted">
            Fluxo de caixa realizado no período e critério selecionados acima. Previsão de entradas a partir de pedidos
            confirmados está fora do escopo desta versão — nenhuma projeção é calculada, apenas valores já realizados.
          </p>

          {cashFlowLoading && <LoadingState count={3} />}
          {!cashFlowLoading && cashFlowError && <ErrorState message={cashFlowError} onRetry={loadCashFlowReport} />}

          {!cashFlowLoading && !cashFlowError && cashFlowReport && (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                value={formatCurrency(cashFlowReport.inflow)}
                label="Entradas"
                note={basis === "pago" ? "Pedidos pagos" : "Pedidos entregues"}
              />
              <StatCard value={formatCurrency(cashFlowReport.outflow)} label="Saídas" note="Despesas pagas no período" />
              <StatCard
                value={formatCurrency(cashFlowReport.balance)}
                label="Saldo do período"
                note={cashFlowReport.balance >= 0 ? "Entradas − saídas" : "Saldo negativo no período"}
              />
            </div>
          )}
        </div>

        {/* ─── DRE (Sprint 3 — Épico 3) ────────────────────────────────────── */}
        <div className="border-t border-sand pt-4">
          <h2 className="font-display text-base font-semibold text-chocolate">DRE — Demonstrativo de resultado</h2>
          <p className="mt-1 text-xs text-muted">
            &quot;Devoluções e cancelamentos&quot; não é calculada/deduzida nesta versão — decisão explícita do Product
            Owner, por não existir hoje um valor de pedido cancelado confiável para deduzir.
          </p>

          {dreLoading && <LoadingState count={1} />}
          {!dreLoading && dreError && <ErrorState message={dreError} onRetry={loadDREReport} />}

          {!dreLoading && !dreError && dreReport && (
            <div className="shadow-card mt-3 rounded-2xl border border-sand bg-card p-4">
              <dl className="divide-y divide-sand/60">
                <DRELine label="Receita líquida" value={dreReport.netRevenue} />
                <DRELine label="(−) CMV" value={-dreReport.cmv} />
                <DRELine label="(=) Lucro bruto" value={dreReport.grossProfit} emphasis />
                <DRELine label="(−) Despesas operacionais" value={-dreReport.operatingExpenses} />
                <DRELine label="(=) EBITDA" value={dreReport.ebitda} emphasis />
                <DRELine label="(−) Impostos" value={-dreReport.taxes} />
                <DRELine label="(=) Lucro líquido" value={dreReport.netProfit} emphasis />
              </dl>
            </div>
          )}
        </div>

        {/* ─── Contas a pagar (Sprint 3 — Épico 3) ─────────────────────────── */}
        <div className="border-t border-sand pt-4">
          <h2 className="font-display text-base font-semibold text-chocolate">Contas a pagar</h2>
          <p className="mt-1 text-xs text-muted">
            Não filtrado por período — reflete a situação atual (despesas pendentes agora), independente do filtro de
            datas De/Até selecionado acima.
          </p>

          {payableLoading && <LoadingState count={2} />}
          {!payableLoading && payableError && <ErrorState message={payableError} onRetry={loadPayableReport} />}

          {!payableLoading && !payableError && payableReport && (
            <>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <StatCard value={formatCurrency(payableReport.totalPending)} label="Total pendente" />
                <div
                  className={`shadow-card rounded-2xl border px-4 py-3 ${
                    payableReport.totalOverdue > 0 ? "border-rose bg-rose/5" : "border-sand bg-white"
                  }`}
                >
                  <p className={`text-xs font-semibold ${payableReport.totalOverdue > 0 ? "text-rose" : "text-muted"}`}>
                    Total vencido
                  </p>
                  <p
                    className={`font-display mt-2 text-2xl font-semibold ${
                      payableReport.totalOverdue > 0 ? "text-rose" : "text-chocolate"
                    }`}
                  >
                    {formatCurrency(payableReport.totalOverdue)}
                  </p>
                  {payableReport.totalOverdue > 0 && (
                    <p className="mt-1 text-xs font-medium text-rose">Há despesas vencidas — priorize o pagamento.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {payableByCategory.length === 0 ? (
                  <EmptyState title="Nenhuma despesa pendente" description="Não há contas a pagar em aberto no momento." />
                ) : (
                  payableByCategory.map((bucket) => (
                    <div key={bucket.category}>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-display text-sm font-semibold text-chocolate">
                          {EXPENSE_CATEGORY_LABELS[bucket.category as ExpenseCategory] ?? bucket.category}
                        </h3>
                        <span className="text-sm text-muted">{formatCurrency(bucket.total)}</span>
                      </div>
                      <EntityTable items={bucket.items} columns={payableColumns} getKey={(i) => i.id} />
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
