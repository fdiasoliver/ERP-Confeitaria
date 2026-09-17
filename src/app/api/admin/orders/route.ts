import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireOrderAccess } from "@/lib/auth/requireOrderAccess";
import { ok, created, badRequest, invalidBody, notFound, internalError } from "@/lib/http/responses";
import type { OrderStatus, QuoteStatus, ValidationError } from "@/lib/types";
import { CustomerNotFoundError } from "@/lib/customerService";
import {
  getKanbanData,
  listOrders,
  createOrder,
  OrderValidationFailedError,
  OrderInvalidAddressError,
  type CreateOrderInput,
  type ListOrdersFilters,
} from "@/lib/orderService";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "RASCUNHO",
  "CONFIRMADO",
  "EM_PRODUCAO",
  "PRONTO",
  "SAIU_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
];

const VALID_QUOTE_STATUSES: QuoteStatus[] = [
  "PENDENTE",
  "EM_REVISAO",
  "APROVADO",
  "RECUSADO",
];

export async function GET(request: NextRequest) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);

  // `status`/`quotesOnly`/`quoteStatus` (os dois últimos, novos nesta sprint —
  // usados pela futura tela /admin/orcamentos) são um caminho de leitura
  // separado do Kanban — quando qualquer um está presente, não aplica o
  // filtro de `date` abaixo (listOrders não aceita `date`, ver
  // orderService.ts). Sem nenhum deles, o comportamento é idêntico ao de
  // antes desta sprint.
  const statusParam = searchParams.get("status");
  const quotesOnlyParam = searchParams.get("quotesOnly");
  const quoteStatusParam = searchParams.get("quoteStatus");

  const hasStatus = statusParam !== null && statusParam.trim().length > 0;
  const hasQuotesOnly = quotesOnlyParam === "true";
  const hasQuoteStatus = quoteStatusParam !== null && quoteStatusParam.trim().length > 0;

  if (hasStatus || hasQuotesOnly || hasQuoteStatus) {
    const filters: ListOrdersFilters = {};

    if (hasStatus) {
      if (!VALID_ORDER_STATUSES.includes(statusParam as OrderStatus)) {
        const error: ValidationError = {
          field: "status",
          code: "INVALID_STATUS",
          message: "Status inválido.",
        };
        return badRequest([error]);
      }
      filters.status = statusParam as OrderStatus;
    }

    if (hasQuotesOnly) {
      filters.quotesOnly = true;
    }

    if (hasQuoteStatus) {
      if (!VALID_QUOTE_STATUSES.includes(quoteStatusParam as QuoteStatus)) {
        const error: ValidationError = {
          field: "quoteStatus",
          code: "INVALID_QUOTE_STATUS",
          message: "Status de orçamento inválido.",
        };
        return badRequest([error]);
      }
      filters.quoteStatus = quoteStatusParam as QuoteStatus;
    }

    try {
      const result = await listOrders(filters);
      return ok(result);
    } catch {
      return internalError();
    }
  }

  const dateParam = searchParams.get("date");
  let date: Date | undefined;
  if (dateParam !== null && dateParam.trim().length > 0) {
    const parsed = new Date(`${dateParam}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      const error: ValidationError = {
        field: "date",
        code: "INVALID_DATE",
        message: "Data inválida. Use o formato YYYY-MM-DD.",
      };
      return badRequest([error]);
    }
    date = parsed;
  }

  try {
    const result = await getKanbanData(date);
    return ok(result);
  } catch {
    return internalError();
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireOrderAccess();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidBody();
  }

  const session = await getServerSession(authOptions);
  const createdById = session?.user?.id ?? null;

  try {
    const result = await createOrder(body as CreateOrderInput, "RASCUNHO", createdById);
    return created(result);
  } catch (err) {
    if (err instanceof OrderValidationFailedError) return badRequest(err.errors);
    if (err instanceof OrderInvalidAddressError) {
      return badRequest([{ field: "addressId", code: "INVALID_ADDRESS", message: err.message }]);
    }
    if (err instanceof CustomerNotFoundError) return notFound("Cliente não encontrado.");
    return internalError();
  }
}
