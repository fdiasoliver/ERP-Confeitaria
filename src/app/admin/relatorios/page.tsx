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
} from "@/lib/api/reportsApi";

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

export default function RelatoriosAdminPage() {
  const [startDate, setStartDate] = useState(toDateParam(firstDayOfMonth()));
  const [endDate, setEndDate] = useState(toDateParam(new Date()));
  const [basis, setBasis] = useState<RevenueBasis>("entregue");
  const [report, setReport] = useState<FinancialReportDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadReport(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [startDate, endDate, basis]); // eslint-disable-line react-hooks/exhaustive-deps

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
      </div>
    </PageContainer>
  );
}
