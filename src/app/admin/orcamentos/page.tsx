"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { Field } from "@/components/admin/config/FormPrimitives";
import { PageContainer } from "@/components/admin/shared/PageContainer";
import { ResponsiveGrid } from "@/components/admin/shared/ResponsiveGrid";
import { SearchBar } from "@/components/admin/shared/SearchBar";
import { LoadingState } from "@/components/admin/shared/LoadingState";
import { ErrorState } from "@/components/admin/shared/ErrorState";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { ConfirmDialog } from "@/components/admin/shared/ConfirmDialog";
import { EntityCard } from "@/components/admin/shared/EntityCard";
import { EntityForm } from "@/components/admin/shared/EntityForm";
import { EntityTable, type EntityColumn } from "@/components/shared/EntityTable";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { useViewMode } from "@/hooks/useViewMode";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDate } from "@/lib/formatters/date";
import { DELIVERY_LABELS, PAYMENT_LABELS, QUOTE_STATUS_LABELS } from "@/lib/types";
import type { DeliveryType, PaymentMethod, QuoteStatus, ValidationError } from "@/lib/types";
import * as orderAdminApi from "@/lib/api/orderAdminApi";
import { ApiRequestError, type OrderDTO, type CreateOrderInput } from "@/lib/api/orderAdminApi";
import * as customerApi from "@/lib/api/customerApi";
import type { CustomerListItem } from "@/lib/api/customerApi";
import * as productApi from "@/lib/api/productApi";
import type { Product } from "@/lib/api/productApi";

// ── Local types ────────────────────────────────────────────────────────────────

interface ItemRowForm {
  productId: string;
  quantity: string;
}
const EMPTY_ITEM_ROW: ItemRowForm = { productId: "", quantity: "1" };

interface OrderForm {
  customerId: string;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryFee: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  receiverName: string;
  receiverPhone: string;
  paymentMethod: PaymentMethod;
  orderNotes: string;
  items: ItemRowForm[];
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Legado (quoteStatus null): orçamento criado antes da funcionalidade de link
// público — sem badge, mantém só os botões Aprovar/Cancelar de sempre.
const QUOTE_STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  PENDENTE: "border-transparent bg-sand text-muted",
  EM_REVISAO: "border-transparent bg-caramel/10 text-caramel",
  APROVADO: "border-transparent bg-sage/10 text-sage",
  RECUSADO: "border-transparent bg-rose/10 text-rose",
};

function QuoteStatusBadge({ quoteStatus }: { quoteStatus: QuoteStatus | null }) {
  if (!quoteStatus) return null;
  return (
    <Badge variant="outline" className={QUOTE_STATUS_BADGE_CLASS[quoteStatus]}>
      {QUOTE_STATUS_LABELS[quoteStatus]}
    </Badge>
  );
}

const EMPTY_ORDER_FORM: OrderForm = {
  customerId: "",
  deliveryType: "RETIRADA",
  deliveryDate: todayISO(),
  deliveryFee: "0",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "São Paulo",
  state: "SP",
  zipCode: "",
  receiverName: "",
  receiverPhone: "",
  paymentMethod: "PIX_ENTREGA",
  orderNotes: "",
  items: [{ ...EMPTY_ITEM_ROW }],
};

interface ConfirmAction {
  type: "cancel" | "recusar";
  order: OrderDTO;
}

// ── Main page ──────────────────────────────────────────────────────────────────
//
// Fila de orçamentos pendentes (Order.status = RASCUNHO), tela própria — decisão
// já validada pelo AI Solution Architect (não reaberta aqui). Ponto de entrada de
// criação: botão "+ Novo orçamento" nesta página, com deep link de
// /admin/clientes/[id] (?customerId=...) pré-selecionando o cliente — mesma
// convenção de ?edit=id já usada em admin/produtos/page.tsx.

// useSearchParams() exige um limite de Suspense — mesma convenção de admin/produtos/page.tsx.
export default function OrcamentosAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Carregando…</div>}>
      <OrcamentosAdminPageContent />
    </Suspense>
  );
}

function OrcamentosAdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewMode("orcamentos");

  const [modal, setModal] = useState<"create" | null>(null);
  const [form, setForm] = useState<OrderForm>(EMPTY_ORDER_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const hasLoadedOnce = useRef(false);

  async function loadOrders(silent = hasLoadedOnce.current) {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const rows = await orderAdminApi.listOrdersByStatus("RASCUNHO");
      setOrders(rows);
      hasLoadedOnce.current = true;
    } catch (err) {
      if (silent) {
        toast.error("Erro ao atualizar lista de orçamentos.");
      } else {
        setError(err instanceof Error ? err.message : "Erro ao carregar orçamentos.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Dados de apoio (clientes e produtos ativos) — carregados uma única vez, usados
  // no formulário de criação. Mesmo padrão de embalagens/produtos (Promise.all).
  useEffect(() => {
    (async () => {
      try {
        const [customerRows, productRows] = await Promise.all([
          customerApi.listCustomers({ pageSize: 1000, active: true, orderBy: "name", orderDirection: "asc" }),
          productApi.listProducts(),
        ]);
        setCustomers(customerRows.items);
        setProducts(productRows.filter((p) => p.active));
      } catch {
        toast.error("Erro ao carregar clientes e produtos de apoio.");
      }
    })();
  }, []);

  // Reabre o modal de criação com o cliente pré-selecionado, a partir do botão
  // "Novo orçamento" em /admin/clientes/[id] (?customerId=...) — limpa o
  // parâmetro da URL depois de abrir, para não reabrir em um refresh.
  useEffect(() => {
    const customerId = searchParams.get("customerId");
    if (!customerId) return;
    openCreate(customerId);
    router.replace("/admin/orcamentos");
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sem suporte a busca no endpoint GET .../orders?status= (só filtra por status,
  // ver orderService.ts listOrders) — filtro client-side sobre a lista já
  // carregada, mesmo espírito de 4.11 (frontend-pattern), aplicado aqui porque a
  // API não expõe um parâmetro de busca para este caminho de leitura.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter(
      (o) => o.receiverName.toLowerCase().includes(term) || String(o.orderNumber).includes(term),
    );
  }, [orders, search]);

  const hasActiveFilter = search.trim() !== "";
  const canCreate = customers.length > 0 && products.length > 0;

  // ── Formulário de criação ("Novo orçamento") ───────────────────────────────

  function openCreate(customerId = "") {
    setForm({ ...EMPTY_ORDER_FORM, deliveryDate: todayISO(), customerId });
    setFormErrors({});
    setModal("create");
  }

  function closeModal() { setModal(null); setFormErrors({}); }

  const ADDRESS_FIELD_KEYS = new Set(["street", "number", "complement", "neighborhood", "city", "state", "zipCode"]);

  function setField<K extends keyof Omit<OrderForm, "items">>(key: K, value: OrderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      // Erro geral de "deliveryAddress" (ex.: DISTANCE_CALCULATION_FAILED) não é ligado a um
      // campo específico do endereço — limpo junto quando qualquer campo do endereço muda,
      // mesmo espírito de setItemField limpar `items` junto com `items[i].key` (linha acima).
      if (ADDRESS_FIELD_KEYS.has(key as string) || key === "deliveryType") delete n.deliveryAddress;
      return n;
    });
  }

  function setItemField(index: number, key: keyof ItemRowForm, value: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
    setFormErrors((prev) => {
      const n = { ...prev };
      delete n[`items[${index}].${key}`];
      delete n.items;
      return n;
    });
  }

  function addItemRow() {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM_ROW }] }));
  }

  function removeItemRow(index: number) {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  // Preço unitário sempre o `basePrice` atual do produto — mesmo espírito do
  // checkout público (snapshot no momento da criação do pedido), sem edição
  // manual de preço nesta tela (fora do escopo desta sprint).
  const itemsSubtotal = form.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    const qty = parseFloat(item.quantity);
    if (!product || Number.isNaN(qty) || qty <= 0) return sum;
    return sum + product.basePrice * qty;
  }, 0);
  const feeValue = form.deliveryType === "ENTREGA_GRATIS" ? 0 : (parseFloat(form.deliveryFee) || 0);
  const orderTotal = itemsSubtotal + feeValue;

  function validateForm(): boolean {
    const errs: Record<string, string> = {};
    if (!form.customerId) errs.customerId = "Selecione um cliente.";
    if (!form.deliveryDate) errs.deliveryDate = "Data de entrega é obrigatória.";

    if (form.deliveryType !== "RETIRADA") {
      if (!form.street.trim()) errs.street = "Rua é obrigatória.";
      if (!form.number.trim()) errs.number = "Número é obrigatório.";
      if (!form.neighborhood.trim()) errs.neighborhood = "Bairro é obrigatório.";
      if (!form.city.trim()) errs.city = "Cidade é obrigatória.";
      if (!form.state.trim()) errs.state = "Estado é obrigatório.";
      if (!form.zipCode.trim()) errs.zipCode = "CEP é obrigatório.";
    }

    form.items.forEach((item, index) => {
      if (!item.productId) errs[`items[${index}].productId`] = "Selecione um produto.";
      const qty = parseFloat(item.quantity);
      if (item.quantity.trim() === "" || Number.isNaN(qty) || qty <= 0) {
        errs[`items[${index}].quantity`] = "Quantidade deve ser maior que zero.";
      }
    });

    const ids = form.items.map((i) => i.productId).filter(Boolean);
    if (new Set(ids).size !== ids.length) errs.items = "Não repita o mesmo produto no orçamento.";

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
    const toastId = toast.loading("Criando orçamento…");
    try {
      const items = form.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error("Produto inválido.");
        const quantity = parseFloat(item.quantity);
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.basePrice,
          totalPrice: product.basePrice * quantity,
        };
      });
      const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
      const deliveryFee = form.deliveryType === "ENTREGA_GRATIS" ? 0 : (parseFloat(form.deliveryFee) || 0);

      const input: CreateOrderInput = {
        customerId: form.customerId,
        deliveryDate: form.deliveryDate,
        deliveryType: form.deliveryType,
        deliveryFee,
        paymentMethod: form.paymentMethod,
        subtotal,
        total: subtotal + deliveryFee,
        items,
        receiverName: form.receiverName.trim() || undefined,
        receiverPhone: form.receiverPhone.trim() || undefined,
        orderNotes: form.orderNotes.trim() || undefined,
      };
      if (form.deliveryType !== "RETIRADA") {
        input.deliveryAddress = {
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim() || undefined,
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
        };
      }

      const created = await orderAdminApi.createOrder(input);
      toast.success(`Orçamento #${created.orderNumber} criado.`, { id: toastId });
      closeModal();
      await loadOrders(true);
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VALIDATION_ERROR" && applyServerValidationErrors(err.details)) {
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else if (err instanceof ApiRequestError) {
        toast.error(err.message, { id: toastId });
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao criar orçamento.", { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Ciclo de vida do orçamento ──────────────────────────────────────────────
  // Ações constutivas (Enviar/Copiar link/Aprovar/Confirmar pedido) são diretas,
  // sem confirmação — mesmo espírito de "Ativar" (4.7, frontend-pattern).
  // Destrutivas (Cancelar/Recusar, ambas terminam em Order.status=CANCELADO)
  // sempre passam por ConfirmDialog — mesmo espírito de "Desativar"/"Excluir".
  // Legado (quoteStatus null, orçamento criado antes desta funcionalidade):
  // handleApprove mantém o comportamento original (RASCUNHO → CONFIRMADO direto).

  async function handleApprove(order: OrderDTO) {
    setActionLoading(order.id);
    const toastId = toast.loading("Aprovando orçamento…");
    try {
      await orderAdminApi.updateOrderStatus(order.id, "CONFIRMADO");
      toast.success(`Orçamento #${order.orderNumber} aprovado e confirmado.`, { id: toastId });
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao aprovar orçamento.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSendQuote(order: OrderDTO) {
    setActionLoading(order.id);
    const toastId = toast.loading("Enviando orçamento por WhatsApp…");
    try {
      await orderAdminApi.sendQuote(order.id);
      toast.success(`Orçamento #${order.orderNumber} enviado.`, { id: toastId });
      await loadOrders(true);
    } catch (err) {
      if (err instanceof ApiRequestError && Array.isArray(err.details) && err.details[0]?.message) {
        toast.error(err.details[0].message, { id: toastId });
      } else {
        toast.error(err instanceof ApiRequestError ? err.message : "Erro ao enviar orçamento.", { id: toastId });
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCopyLink(order: OrderDTO) {
    setActionLoading(order.id);
    try {
      const { url } = await orderAdminApi.getOrCreateShareLink(order.id);
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado.");
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao gerar o link.");
    } finally {
      setActionLoading(null);
    }
  }

  // Decisão administrativa em nome do cliente (ex.: confirmação por telefone) —
  // sem a confirmação de segurança exigida no link público (decideQuote,
  // source: "ADMIN", ver orderService.ts).
  async function handleAdminApproveQuote(order: OrderDTO) {
    setActionLoading(order.id);
    const toastId = toast.loading("Aprovando orçamento…");
    try {
      await orderAdminApi.updateQuoteStatus(order.id, "APROVADO");
      toast.success(`Orçamento #${order.orderNumber} aprovado.`, { id: toastId });
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao aprovar orçamento.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleConfirmOrder(order: OrderDTO) {
    setActionLoading(order.id);
    const toastId = toast.loading("Confirmando pedido…");
    try {
      await orderAdminApi.updateOrderStatus(order.id, "CONFIRMADO");
      toast.success(`Pedido #${order.orderNumber} confirmado.`, { id: toastId });
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao confirmar pedido.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  // Cobre "cancel" (Order.status → CANCELADO direto, legado/PENDENTE) e
  // "recusar" (quoteStatus → RECUSADO, cascateia para Order.status = CANCELADO
  // no backend — ver decideQuote em orderService.ts).
  async function handleConfirmDestructive() {
    if (!confirmAction) return;
    const { type, order } = confirmAction;
    setConfirmAction(null);
    setActionLoading(order.id);
    const isCancel = type === "cancel";
    const toastId = toast.loading(isCancel ? "Cancelando orçamento…" : "Recusando orçamento…");
    try {
      if (isCancel) {
        await orderAdminApi.updateOrderStatus(order.id, "CANCELADO");
      } else {
        await orderAdminApi.updateQuoteStatus(order.id, "RECUSADO");
      }
      toast.success(`Orçamento #${order.orderNumber} ${isCancel ? "cancelado" : "recusado"}.`, { id: toastId });
      await loadOrders(true);
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Erro ao processar ação.", { id: toastId });
    } finally {
      setActionLoading(null);
    }
  }

  function renderActions(order: OrderDTO, variant: "card" | "row") {
    const base =
      variant === "card"
        ? "flex-1 rounded-xl py-2 text-sm font-semibold"
        : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold";
    const busy = actionLoading === order.id;
    const approveClass = `${base} bg-sage/10 text-sage transition-colors hover:bg-sage/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:opacity-50`;
    const dangerClass = `${base} border border-rose/40 text-rose transition-colors hover:bg-rose/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose disabled:opacity-50`;
    const neutralClass = `${base} border border-sand text-chocolate transition-colors hover:bg-sand/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50`;

    if (order.quoteStatus === "PENDENTE") {
      return (
        <>
          <button type="button" onClick={() => handleSendQuote(order)} disabled={busy} aria-label={`Enviar orçamento ${order.orderNumber} por WhatsApp`} className={approveClass}>
            {busy ? "…" : "Enviar"}
          </button>
          <button type="button" onClick={() => handleCopyLink(order)} disabled={busy} aria-label={`Copiar link do orçamento ${order.orderNumber}`} className={neutralClass}>
            Link
          </button>
          <button type="button" onClick={() => setConfirmAction({ type: "cancel", order })} disabled={busy} aria-label={`Cancelar orçamento ${order.orderNumber}`} className={dangerClass}>
            Cancelar
          </button>
        </>
      );
    }

    if (order.quoteStatus === "EM_REVISAO") {
      return (
        <>
          <button type="button" onClick={() => handleCopyLink(order)} disabled={busy} aria-label={`Copiar link do orçamento ${order.orderNumber}`} className={neutralClass}>
            Link
          </button>
          <button type="button" onClick={() => handleAdminApproveQuote(order)} disabled={busy} aria-label={`Aprovar orçamento ${order.orderNumber}`} className={approveClass}>
            {busy ? "…" : "Aprovar"}
          </button>
          <button type="button" onClick={() => setConfirmAction({ type: "recusar", order })} disabled={busy} aria-label={`Recusar orçamento ${order.orderNumber}`} className={dangerClass}>
            Recusar
          </button>
        </>
      );
    }

    if (order.quoteStatus === "APROVADO") {
      return (
        <button type="button" onClick={() => handleConfirmOrder(order)} disabled={busy} aria-label={`Confirmar pedido ${order.orderNumber}`} className={approveClass}>
          {busy ? "…" : "Confirmar pedido"}
        </button>
      );
    }

    // quoteStatus null — orçamento criado antes desta funcionalidade.
    return (
      <>
        <button type="button" onClick={() => handleApprove(order)} disabled={busy} aria-label={`Aprovar orçamento ${order.orderNumber}`} className={approveClass}>
          {busy ? "…" : "Aprovar"}
        </button>
        <button type="button" onClick={() => setConfirmAction({ type: "cancel", order })} disabled={busy} aria-label={`Cancelar orçamento ${order.orderNumber}`} className={dangerClass}>
          Cancelar
        </button>
      </>
    );
  }

  const columns: EntityColumn<OrderDTO>[] = [
    {
      key: "orderNumber",
      header: "Pedido",
      render: (o) => <span className="font-semibold text-chocolate">#{o.orderNumber}</span>,
    },
    {
      key: "receiverName",
      header: "Destinatário",
      render: (o) => <span className="text-chocolate">{o.receiverName}</span>,
    },
    {
      key: "deliveryDate",
      header: "Entrega",
      className: "hidden md:table-cell",
      render: (o) => <span className="text-muted">{formatDate(o.deliveryDate)}</span>,
    },
    {
      key: "deliveryType",
      header: "Tipo",
      className: "hidden lg:table-cell",
      render: (o) => <span className="text-muted">{DELIVERY_LABELS[o.deliveryType].title}</span>,
    },
    {
      key: "quoteStatus",
      header: "Status",
      render: (o) => <QuoteStatusBadge quoteStatus={o.quoteStatus} />,
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      render: (o) => <span className="font-semibold text-chocolate">{formatCurrency(o.total)}</span>,
    },
  ];

  return (
    <PageContainer>
      <HeaderMinimal title="Orçamentos" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading
              ? "Carregando…"
              : `${orders.length} orçamento${orders.length !== 1 ? "s" : ""} pendente${orders.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            {!loading && !error && <ViewToggle value={view} onChange={setView} />}
            <button
              type="button"
              onClick={() => openCreate()}
              disabled={!canCreate}
              title={canCreate ? undefined : "Cadastre ao menos um cliente e um produto ativo antes de criar um orçamento."}
              className="rounded-xl bg-chocolate px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-chocolate/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate disabled:opacity-50"
            >
              + Novo orçamento
            </button>
          </div>
        </div>

        {!error && (
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por destinatário ou nº do pedido…"
            ariaLabel="Pesquisar orçamento por destinatário ou número do pedido"
          />
        )}

        {loading && <LoadingState count={3} />}
        {!loading && error && <ErrorState message={error} onRetry={() => loadOrders(false)} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title={hasActiveFilter ? "Nenhum orçamento encontrado" : "Nenhum orçamento pendente"}
            description={
              hasActiveFilter
                ? "Ajuste a pesquisa para ver todos os orçamentos."
                : "Orçamentos aprovados ou cancelados saem desta lista automaticamente."
            }
            actionLabel={hasActiveFilter || !canCreate ? undefined : "+ Criar orçamento"}
            onAction={hasActiveFilter || !canCreate ? undefined : () => openCreate()}
          />
        )}
        {!loading && !error && filtered.length > 0 && (
          <>
            {view === "grid" && (
              <ResponsiveGrid cols={3}>
                {filtered.map((order) => (
                  <EntityCard
                    key={order.id}
                    title={`#${order.orderNumber} · ${order.receiverName}`}
                    badges={<QuoteStatusBadge quoteStatus={order.quoteStatus} />}
                    actions={renderActions(order, "card")}
                  >
                    <p className="text-xs text-muted">
                      Entrega em {formatDate(order.deliveryDate)} · {DELIVERY_LABELS[order.deliveryType].title}
                    </p>
                    <p className="text-sm font-semibold text-chocolate">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-muted">{PAYMENT_LABELS[order.paymentMethod]}</p>
                  </EntityCard>
                ))}
              </ResponsiveGrid>
            )}
            {view === "list" && (
              <EntityTable
                items={filtered}
                columns={columns}
                getKey={(o) => o.id}
                renderActions={(o) => renderActions(o, "row")}
              />
            )}
          </>
        )}
      </div>

      {modal && (
        <EntityForm
          title="Novo orçamento"
          submitting={submitting}
          submitLabel="Criar orçamento"
          onClose={closeModal}
          onSubmit={handleCreateSubmit}
        >
          <Field label="Cliente" required htmlFor="order-customer" error={formErrors.customerId}>
            <select
              id="order-customer"
              className={`input-field ${formErrors.customerId ? "border-rose" : ""}`}
              value={form.customerId}
              onChange={(e) => setField("customerId", e.target.value)}
              disabled={submitting}
            >
              <option value="">Selecione o cliente…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ""}</option>
              ))}
            </select>
          </Field>

          <Field label="Data de entrega" required htmlFor="order-delivery-date" error={formErrors.deliveryDate}>
            <input
              id="order-delivery-date"
              type="date"
              min={todayISO()}
              className={`input-field ${formErrors.deliveryDate ? "border-rose" : ""}`}
              value={form.deliveryDate}
              onChange={(e) => setField("deliveryDate", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <Field label="Tipo de entrega" required htmlFor="order-delivery-type" error={formErrors.deliveryType}>
            <select
              id="order-delivery-type"
              className={`input-field ${formErrors.deliveryType ? "border-rose" : ""}`}
              value={form.deliveryType}
              onChange={(e) => setField("deliveryType", e.target.value as DeliveryType)}
              disabled={submitting}
            >
              {(Object.keys(DELIVERY_LABELS) as DeliveryType[]).map((type) => (
                <option key={type} value={type}>{DELIVERY_LABELS[type].title}</option>
              ))}
            </select>
          </Field>

          {form.deliveryType === "ENTREGA_APP" && (
            <Field label="Taxa de entrega" htmlFor="order-delivery-fee">
              <input
                id="order-delivery-fee"
                type="number"
                step="any"
                min={0}
                className="input-field"
                value={form.deliveryFee}
                onChange={(e) => setField("deliveryFee", e.target.value)}
                placeholder="Ex: 18.00"
                disabled={submitting}
              />
            </Field>
          )}

          {form.deliveryType !== "RETIRADA" && (
            <div className="space-y-3 rounded-xl border border-sand p-3">
              <p className="text-xs font-medium text-muted">Endereço de entrega</p>
              {formErrors.deliveryAddress && (
                <p className="rounded-lg bg-rose/10 px-3 py-2 text-xs text-rose">{formErrors.deliveryAddress}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field label="Rua" required htmlFor="order-street" error={formErrors.street}>
                    <input
                      id="order-street"
                      className={`input-field ${formErrors.street ? "border-rose" : ""}`}
                      value={form.street}
                      onChange={(e) => setField("street", e.target.value)}
                      disabled={submitting}
                    />
                  </Field>
                </div>
                <Field label="Número" required htmlFor="order-number" error={formErrors.number}>
                  <input
                    id="order-number"
                    className={`input-field ${formErrors.number ? "border-rose" : ""}`}
                    value={form.number}
                    onChange={(e) => setField("number", e.target.value)}
                    disabled={submitting}
                  />
                </Field>
              </div>
              <Field label="Complemento (opcional)" htmlFor="order-complement">
                <input
                  id="order-complement"
                  className="input-field"
                  value={form.complement}
                  onChange={(e) => setField("complement", e.target.value)}
                  disabled={submitting}
                />
              </Field>
              <Field label="Bairro" required htmlFor="order-neighborhood" error={formErrors.neighborhood}>
                <input
                  id="order-neighborhood"
                  className={`input-field ${formErrors.neighborhood ? "border-rose" : ""}`}
                  value={form.neighborhood}
                  onChange={(e) => setField("neighborhood", e.target.value)}
                  disabled={submitting}
                />
              </Field>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Field label="Cidade" required htmlFor="order-city" error={formErrors.city}>
                    <input
                      id="order-city"
                      className={`input-field ${formErrors.city ? "border-rose" : ""}`}
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      disabled={submitting}
                    />
                  </Field>
                </div>
                <Field label="UF" required htmlFor="order-state" error={formErrors.state}>
                  <input
                    id="order-state"
                    maxLength={2}
                    className={`input-field ${formErrors.state ? "border-rose" : ""}`}
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value.toUpperCase())}
                    disabled={submitting}
                  />
                </Field>
              </div>
              <Field label="CEP" required htmlFor="order-zip" error={formErrors.zipCode}>
                <input
                  id="order-zip"
                  className={`input-field ${formErrors.zipCode ? "border-rose" : ""}`}
                  value={form.zipCode}
                  onChange={(e) => setField("zipCode", e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Destinatário (opcional)" htmlFor="order-receiver-name">
              <input
                id="order-receiver-name"
                className="input-field"
                value={form.receiverName}
                onChange={(e) => setField("receiverName", e.target.value)}
                placeholder="Nome de quem recebe"
                disabled={submitting}
              />
            </Field>
            <Field label="Telefone do destinatário (opcional)" htmlFor="order-receiver-phone">
              <input
                id="order-receiver-phone"
                className="input-field"
                value={form.receiverPhone}
                onChange={(e) => setField("receiverPhone", e.target.value)}
                disabled={submitting}
              />
            </Field>
          </div>

          <Field label="Forma de pagamento" required htmlFor="order-payment-method">
            <select
              id="order-payment-method"
              className="input-field"
              value={form.paymentMethod}
              onChange={(e) => setField("paymentMethod", e.target.value as PaymentMethod)}
              disabled={submitting}
            >
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>{PAYMENT_LABELS[method]}</option>
              ))}
            </select>
          </Field>

          <Field label="Observações (opcional)" htmlFor="order-notes">
            <textarea
              id="order-notes"
              className="input-field"
              rows={2}
              value={form.orderNotes}
              onChange={(e) => setField("orderNotes", e.target.value)}
              disabled={submitting}
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-chocolate">
                Itens <span className="text-rose">*</span>
              </p>
              <button
                type="button"
                onClick={addItemRow}
                disabled={submitting}
                className="text-sm font-semibold text-chocolate underline disabled:opacity-50"
              >
                + Adicionar item
              </button>
            </div>
            {formErrors.items && <p className="mb-2 text-xs text-rose">{formErrors.items}</p>}

            <div className="space-y-3">
              {form.items.map((item, index) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div key={index} className="rounded-xl border border-sand p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-muted">Item {index + 1}</p>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={submitting}
                          aria-label={`Remover item ${index + 1}`}
                          className="text-xs font-semibold text-rose disabled:opacity-50"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <select
                        className={`input-field ${formErrors[`items[${index}].productId`] ? "border-rose" : ""}`}
                        value={item.productId}
                        onChange={(e) => setItemField(index, "productId", e.target.value)}
                        disabled={submitting}
                        aria-label={`Produto do item ${index + 1}`}
                      >
                        <option value="">Selecione o produto…</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.basePrice)}</option>
                        ))}
                      </select>
                      {formErrors[`items[${index}].productId`] && (
                        <p className="text-xs text-rose">{formErrors[`items[${index}].productId`]}</p>
                      )}
                      <input
                        type="number"
                        step="1"
                        min={1}
                        className={`input-field ${formErrors[`items[${index}].quantity`] ? "border-rose" : ""}`}
                        value={item.quantity}
                        onChange={(e) => setItemField(index, "quantity", e.target.value)}
                        placeholder="Quantidade"
                        disabled={submitting}
                        aria-label={`Quantidade do item ${index + 1}`}
                      />
                      {formErrors[`items[${index}].quantity`] && (
                        <p className="text-xs text-rose">{formErrors[`items[${index}].quantity`]}</p>
                      )}
                      {product && (
                        <p className="text-xs text-muted">
                          Subtotal: {formatCurrency(product.basePrice * (parseFloat(item.quantity) || 0))}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-sand/40 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Itens</span>
              <span className="text-chocolate">{formatCurrency(itemsSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Entrega</span>
              <span className="text-chocolate">{formatCurrency(feeValue)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-sand pt-1 text-sm font-semibold">
              <span className="text-chocolate">Total</span>
              <span className="text-chocolate">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </EntityForm>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.type === "cancel" ? "Cancelar orçamento?" : "Recusar orçamento?"}
          description={
            <>
              O orçamento <strong className="text-chocolate">#{confirmAction.order.orderNumber}</strong> será{" "}
              {confirmAction.type === "cancel" ? "cancelado" : "recusado e cancelado"} e sairá desta lista. Esta ação
              não pode ser desfeita.
            </>
          }
          cancelLabel="Manter orçamento"
          confirmLabel={confirmAction.type === "cancel" ? "Cancelar orçamento" : "Recusar orçamento"}
          busy={actionLoading === confirmAction.order.id}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirmDestructive}
        />
      )}
    </PageContainer>
  );
}
