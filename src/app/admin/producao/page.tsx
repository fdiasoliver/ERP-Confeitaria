"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { StatCard } from "@/components/admin/shared/StatCard";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { ProductionLoadCalendar } from "@/components/admin/producao/ProductionLoadCalendar";
import { STATUS_LABELS, DELIVERY_LABELS } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters/currency";
import * as orderAdminApi from "@/lib/api/orderAdminApi";
import {
  ApiRequestError,
  type KanbanColumn,
  type KanbanDataDTO,
  type KanbanOrderDTO,
  type ConsolidatedIngredientDTO,
  type CMVResultDTO,
  type ProductionLoadDayDTO,
} from "@/lib/api/orderAdminApi";

// ── Constantes locais ────────────────────────────────────────────────────────

const TABS = ["Hoje", "Amanhã", "Semana", "Calendário"] as const;
type Tab = (typeof TABS)[number];

const COLUMN_ORDER: KanbanColumn[] = ["CONFIRMADO", "EM_PRODUCAO", "PRONTO", "ENTREGUE"];

const COLUMN_LABELS: Record<KanbanColumn, string> = {
  CONFIRMADO: "Confirmado",
  EM_PRODUCAO: "Em produção",
  PRONTO: "Pronto",
  ENTREGUE: "Entregue",
};

// Espelha VALID_TRANSITIONS de src/lib/orderService.ts — cópia deliberada no
// client, apenas para decidir quais opções de "mover para" oferecer em cada
// card (mesmo padrão de validateForm() espelhando o Validator do backend, ver
// skill frontend-pattern 4.9: duplicação aceita, backend é a fonte de verdade
// final). Qualquer divergência real entre esta cópia e o backend retorna 409
// INVALID_STATUS_TRANSITION, tratado em handleConfirmMove — nunca trava a UI.
// CANCELADO propositalmente fora das opções desta tela: mover um pedido para
// "Cancelado" é uma ação distinta de "mover entre colunas do Kanban" e não foi
// pedida nesta sprint (2.K.3) — decisão registrada, não omissão silenciosa.
const NEXT_STATUS_OPTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  CONFIRMADO: ["EM_PRODUCAO"],
  EM_PRODUCAO: ["PRONTO"],
  PRONTO: ["SAIU_ENTREGA", "ENTREGUE"],
  SAIU_ENTREGA: ["ENTREGUE"],
};

function toDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatQuantity(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function statusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "RASCUNHO":
      return "bg-sand text-muted";
    case "CONFIRMADO":
      return "bg-sand text-chocolate";
    case "EM_PRODUCAO":
      return "bg-chocolate/10 text-chocolate";
    case "PRONTO":
    case "SAIU_ENTREGA":
      return "bg-sage/10 text-sage";
    case "ENTREGUE":
      return "bg-sage text-white";
    case "CANCELADO":
      return "bg-rose/10 text-rose";
  }
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClass(status)}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function itemsSummary(items: KanbanOrderDTO["items"]): string {
  return items.map((item) => `${item.quantity}× ${item.productName}`).join(", ");
}

interface MoveTarget {
  order: KanbanOrderDTO;
  newStatus: OrderStatus;
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ProducaoPage() {
  const [tab, setTab] = useState<Tab>("Hoje");
  const [kanbanData, setKanbanData] = useState<KanbanDataDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Abas Semana/Calendário: seleciona um dia no calendário de carga (abaixo) para
  // ver o Kanban detalhado daquele dia — reaproveita o mesmo carregamento de
  // Hoje/Amanhã (dateParam), só troca a data de origem (P3.3).
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [productionLoad, setProductionLoad] = useState<ProductionLoadDayDTO[] | null>(null);
  const [loadRangeLoading, setLoadRangeLoading] = useState(false);
  const [loadRangeError, setLoadRangeError] = useState<string | null>(null);

  function handleTabChange(nextTab: Tab) {
    setTab(nextTab);
    setSelectedCalendarDate(null);
  }

  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Consolidação de ingredientes — segue a mesma data da aba ativa (Hoje/
  // Amanhã), carregamento independente do Kanban (chamada de API separada).
  const [consolidation, setConsolidation] = useState<ConsolidatedIngredientDTO[] | null>(null);
  const [consolidationLoading, setConsolidationLoading] = useState(true);
  const [consolidationError, setConsolidationError] = useState<string | null>(null);

  // CMV — independente da aba selecionada, sempre "hoje" e "últimos 7 dias".
  const [cmvToday, setCmvToday] = useState<CMVResultDTO | null>(null);
  const [cmvWeek, setCmvWeek] = useState<CMVResultDTO | null>(null);
  const [cmvLoading, setCmvLoading] = useState(true);
  const [cmvError, setCmvError] = useState<string | null>(null);

  // Abas Semana/Calendário: o Kanban detalhado só aparece depois de selecionar
  // um dia no calendário de carga (selectedCalendarDate) — antes disso,
  // dateParam fica null e só a seção do calendário é exibida (P3.3).
  const dateParam = useMemo(() => {
    if (tab === "Hoje") return toDateParam(new Date());
    if (tab === "Amanhã") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return toDateParam(d);
    }
    return selectedCalendarDate;
  }, [tab, selectedCalendarDate]);

  const isRangeTab = tab === "Semana" || tab === "Calendário";

  const loadRange = useMemo(() => {
    if (tab === "Semana") {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 6);
      return { start: toDateParam(start), end: toDateParam(end) };
    }
    if (tab === "Calendário") {
      const start = new Date(calendarMonth);
      const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
      return { start: toDateParam(start), end: toDateParam(end) };
    }
    return null;
  }, [tab, calendarMonth]);

  async function loadProductionLoad() {
    if (!loadRange) return;
    setLoadRangeLoading(true);
    setLoadRangeError(null);
    try {
      const result = await orderAdminApi.getProductionLoad(loadRange.start, loadRange.end);
      setProductionLoad(result);
    } catch (err) {
      setLoadRangeError(err instanceof Error ? err.message : "Erro ao carregar carga de produção.");
    } finally {
      setLoadRangeLoading(false);
    }
  }

  useEffect(() => {
    if (loadRange) loadProductionLoad(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadRange]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToPreviousMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedCalendarDate(null);
  }

  function goToNextMonth() {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedCalendarDate(null);
  }

  const selectedDayLabel = useMemo(() => {
    if (tab === "Hoje") return "hoje";
    if (tab === "Amanhã") return "amanhã";
    if (selectedCalendarDate) {
      return new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    }
    return "";
  }, [tab, selectedCalendarDate]);

  async function load(silent = false) {
    if (!dateParam) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await orderAdminApi.getKanbanData(dateParam);
      setKanbanData(result);
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar dados de produção.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados de produção.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (dateParam) load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [dateParam]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadConsolidation() {
    if (!dateParam) return;
    setConsolidationLoading(true);
    setConsolidationError(null);
    try {
      const result = await orderAdminApi.getConsolidation(dateParam, dateParam);
      setConsolidation(result);
    } catch (err) {
      setConsolidationError(
        err instanceof Error ? err.message : "Erro ao carregar consolidação de ingredientes.",
      );
    } finally {
      setConsolidationLoading(false);
    }
  }

  useEffect(() => {
    if (dateParam) loadConsolidation(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [dateParam]); // eslint-disable-line react-hooks/exhaustive-deps

  // CMV: "Hoje" (startDate=endDate=hoje) e "Últimos 7 dias" (hoje-6..hoje) —
  // sempre as mesmas duas janelas, independente da aba do Kanban selecionada.
  async function loadCMV() {
    setCmvLoading(true);
    setCmvError(null);
    try {
      const today = toDateParam(new Date());
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const [todayResult, weekResult] = await Promise.all([
        orderAdminApi.getCMV(today, today),
        orderAdminApi.getCMV(toDateParam(weekAgo), today),
      ]);
      setCmvToday(todayResult);
      setCmvWeek(weekResult);
    } catch (err) {
      setCmvError(err instanceof Error ? err.message : "Erro ao carregar CMV.");
    } finally {
      setCmvLoading(false);
    }
  }

  useEffect(() => {
    loadCMV(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Seção "Urgente — entrega hoje" (REGRAS_NEGOCIO.md 14.1: deliveryDate = hoje
  // e status ≠ ENTREGUE, RASCUNHO ou CANCELADO). `stats.urgentCount` já vem
  // calculado do backend sobre a data real de hoje, independente da aba
  // (orderService.ts, mesma exclusão desta lista — corrigido na Sprint 2.K.1).
  // A lista de pedidos em si não é retornada pela API — só derivável quando a
  // aba "Hoje" está ativa (o `dateParam` daquela aba é a própria data de hoje).
  // Derivada a partir das colunas já carregadas: um pedido é "urgente" quando
  // seu status real (não a coluna visual) ainda não é ENTREGUE — o que inclui
  // SAIU_ENTREGA, agrupado na coluna "Entregue" apenas visualmente. RASCUNHO e
  // CANCELADO nunca aparecem aqui por não terem coluna no Kanban, consistente
  // com o que `urgentCount` agora também exclui.
  const urgentOrders = useMemo(() => {
    if (tab !== "Hoje" || !kanbanData) return [];
    return COLUMN_ORDER.flatMap((column) => kanbanData.columns[column]).filter(
      (order) => order.status !== "ENTREGUE",
    );
  }, [tab, kanbanData]);

  async function handleConfirmMove() {
    if (!moveTarget) return;
    const { order, newStatus } = moveTarget;
    setMoveTarget(null);
    setActionLoading(order.id);
    const toastId = toast.loading("Atualizando status do pedido…");
    try {
      await orderAdminApi.updateOrderStatus(order.id, newStatus);
      toast.success(`Pedido #${order.orderNumber} movido para "${STATUS_LABELS[newStatus]}".`, { id: toastId });
      await load(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "INVALID_STATUS_TRANSITION") {
        const details = err.details as { from?: OrderStatus; to?: OrderStatus } | undefined;
        const from = details?.from ? STATUS_LABELS[details.from] : STATUS_LABELS[order.status];
        const to = details?.to ? STATUS_LABELS[details.to] : STATUS_LABELS[newStatus];
        toast.error(
          `Não é possível mover de "${from}" para "${to}" — outro usuário pode já ter alterado este pedido. Atualize a página.`,
          { id: toastId },
        );
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar status do pedido.", { id: toastId });
      }
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <PageContainer>
      <HeaderMinimal title="Produção" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTabChange(t)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tab === t ? "bg-chocolate text-white" : "bg-white text-chocolate hover:bg-sand/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isRangeTab && (
          <section className="shadow-card rounded-2xl bg-white p-4">
            {tab === "Calendário" && (
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={goToPreviousMonth} aria-label="Mês anterior" className="rounded-lg px-2 py-1 text-chocolate hover:bg-sand/60">
                  ‹
                </button>
                <p className="font-display font-semibold text-chocolate capitalize">
                  {calendarMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
                <button type="button" onClick={goToNextMonth} aria-label="Próximo mês" className="rounded-lg px-2 py-1 text-chocolate hover:bg-sand/60">
                  ›
                </button>
              </div>
            )}

            {loadRangeLoading && <LoadingState count={1} />}
            {!loadRangeLoading && loadRangeError && <ErrorState message={loadRangeError} onRetry={() => loadProductionLoad()} />}
            {!loadRangeLoading && !loadRangeError && productionLoad && (
              <>
                <ProductionLoadCalendar
                  days={productionLoad}
                  selectedDate={selectedCalendarDate}
                  onSelectDate={setSelectedCalendarDate}
                  layout={tab === "Semana" ? "week" : "month"}
                />
                <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sand" /> sem pedidos</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sage/40" /> normal</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-rose/40" /> sobrecarga</span>
                </div>
              </>
            )}
          </section>
        )}

        {dateParam && (
          <>
            {loading && <LoadingState count={4} />}
            {!loading && error && <ErrorState message={error} onRetry={() => load(false)} />}

            {!loading && !error && kanbanData && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard value={kanbanData.stats.orderCount} label="Pedidos" />
                  <StatCard value={kanbanData.stats.itemCount} label="Itens" />
                  <StatCard value={kanbanData.stats.urgentCount} label="Urgentes" />
                </div>

                {tab === "Hoje" && (
                  <section>
                    <h2 className="font-display mb-3 font-semibold text-chocolate">Urgente — entrega hoje</h2>
                    {urgentOrders.length === 0 ? (
                      <div className="shadow-card rounded-2xl bg-white p-4 text-sm text-muted">
                        Nenhum pedido urgente no momento.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {urgentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="shadow-card rounded-2xl border-l-4 border-rose bg-white p-4"
                          >
                            <p className="text-xs text-muted">
                              #{order.orderNumber} · {order.receiverName}
                              {order.deliveryTimeSlot ? ` · ${order.deliveryTimeSlot}` : ""} ·{" "}
                              {DELIVERY_LABELS[order.deliveryType].title}
                            </p>
                            <p className="mt-1 font-semibold text-chocolate">{itemsSummary(order.items)}</p>
                            {order.orderNotes && (
                              <p className="mt-1 text-sm text-muted">&quot;{order.orderNotes}&quot;</p>
                            )}
                            <div className="mt-2">
                              <OrderStatusBadge status={order.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <h2 className="font-display mb-3 font-semibold text-chocolate">
                    Kanban{isRangeTab ? ` — ${selectedDayLabel}` : ""}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {COLUMN_ORDER.map((column) => {
                      const orders = kanbanData.columns[column];
                      return (
                        <div key={column}>
                          <h4
                            className={`mb-2 border-b-2 pb-2 text-center text-[10px] font-bold uppercase ${
                              column === "EM_PRODUCAO" ? "border-caramel text-caramel" : "border-sand text-muted"
                            }`}
                          >
                            {COLUMN_LABELS[column]} ({orders.length})
                          </h4>
                          {orders.length === 0 && (
                            <p className="text-center text-xs text-muted">—</p>
                          )}
                          {orders.map((order) => {
                            const options = NEXT_STATUS_OPTIONS[order.status] ?? [];
                            return (
                              <div key={order.id} className="shadow-card mb-2 rounded-lg bg-white p-2.5 text-xs">
                                <p className="font-semibold text-chocolate">
                                  #{order.orderNumber} · {order.receiverName}
                                </p>
                                <p className="mt-0.5 text-muted">{itemsSummary(order.items)}</p>
                                {order.deliveryTimeSlot && (
                                  <p className="mt-0.5 text-muted">{order.deliveryTimeSlot}</p>
                                )}
                                <div className="mt-1.5 flex items-center justify-between gap-1">
                                  <OrderStatusBadge status={order.status} />
                                  {options.length > 0 && (
                                    <select
                                      aria-label={`Mover pedido #${order.orderNumber}`}
                                      className="rounded-md border border-sand bg-white px-1 py-0.5 text-[10px]"
                                      value=""
                                      disabled={actionLoading === order.id}
                                      onChange={(e) => {
                                        const newStatus = e.target.value as OrderStatus;
                                        if (!newStatus) return;
                                        setMoveTarget({ order, newStatus });
                                        e.target.value = "";
                                      }}
                                    >
                                      <option value="">Mover…</option>
                                      {options.map((s) => (
                                        <option key={s} value={s}>
                                          {STATUS_LABELS[s]}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {COLUMN_ORDER.every((column) => kanbanData.columns[column].length === 0) && (
                  <EmptyState
                    title="Nenhum pedido para esta data"
                    description={`Não há pedidos em produção para ${selectedDayLabel}.`}
                  />
                )}
              </>
            )}

            <section>
              <h2 className="font-display mb-3 font-semibold text-chocolate">Consolidação de ingredientes</h2>
              {consolidationLoading && <LoadingState count={3} />}
              {!consolidationLoading && consolidationError && (
                <ErrorState message={consolidationError} onRetry={() => loadConsolidation()} />
              )}
              {!consolidationLoading && !consolidationError && consolidation && (
                <>
                  {consolidation.length === 0 ? (
                    <EmptyState
                      title="Nenhum ingrediente a consolidar"
                      description={`Não há pedidos elegíveis para consolidação de ingredientes em ${selectedDayLabel}.`}
                    />
                  ) : (
                    <div className="shadow-card overflow-hidden rounded-2xl bg-white">
                      {consolidation.map((item) => (
                        <div
                          key={item.ingredientId}
                          className="flex items-center justify-between border-b border-sand px-4 py-2.5 text-sm last:border-b-0"
                        >
                          <span className="text-chocolate">{item.ingredientName}</span>
                          <span className="font-semibold text-chocolate">
                            {formatQuantity(item.totalQuantity)} {item.unitAbbreviation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        <section>
          <h2 className="font-display mb-3 font-semibold text-chocolate">CMV</h2>
          {cmvLoading && <LoadingState count={2} />}
          {!cmvLoading && cmvError && <ErrorState message={cmvError} onRetry={() => loadCMV()} />}
          {!cmvLoading && !cmvError && cmvToday && cmvWeek && (
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={formatCurrency(cmvToday.totalCMV)} label="CMV Hoje" />
              <StatCard value={formatCurrency(cmvWeek.totalCMV)} label="CMV Últimos 7 dias" />
            </div>
          )}
        </section>
      </div>

      {moveTarget && (
        <ConfirmDialog
          title={`Mover pedido #${moveTarget.order.orderNumber}?`}
          description={
            <>
              O pedido de <strong className="text-chocolate">{moveTarget.order.receiverName}</strong> será movido de{" "}
              <strong>{STATUS_LABELS[moveTarget.order.status]}</strong> para{" "}
              <strong>{STATUS_LABELS[moveTarget.newStatus]}</strong>.
            </>
          }
          cancelLabel="Cancelar"
          confirmLabel="Mover"
          destructive={false}
          busy={actionLoading === moveTarget.order.id}
          onCancel={() => setMoveTarget(null)}
          onConfirm={handleConfirmMove}
        />
      )}

      <nav className="flex justify-center gap-4 pb-4 text-sm">
        <Link href="/admin" className="text-muted hover:text-chocolate">
          Admin
        </Link>
        <Link href="/wireframes" className="text-muted hover:text-chocolate">
          Wireframes
        </Link>
      </nav>
    </PageContainer>
  );
}
