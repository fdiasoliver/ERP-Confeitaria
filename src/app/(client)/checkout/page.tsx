"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { HeaderMinimal } from "@/components/layout/Header";
import { useCart } from "@/context/CartContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { formatCurrency } from "@/lib/mock-data";
import { getMinDeliveryDate } from "@/lib/utils";
import { createOrder } from "@/services/orderService";
import type { DeliveryType, PaymentMethod } from "@/lib/types";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/types";

const DELIVERY_OPTIONS: {
  type: DeliveryType;
  fee: number;
  distanceKm?: number;
}[] = [
  { type: "RETIRADA", fee: 0 },
  { type: "ENTREGA_GRATIS", fee: 0, distanceKm: 1.8 },
  { type: "ENTREGA_APP", fee: 18 },
];

export default function CheckoutPage() {
  const { status: sessionStatus } = useSession();
  const customer = useCurrentUser();
  const { items, subtotal, updateObservation, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("ENTREGA_GRATIS");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX_ONLINE");
  const [street, setStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<number | null>(null);

  // Preenche os dados do destinatário a partir da sessão ao carregar (apenas uma vez)
  const initializedFromSession = useRef(false);
  useEffect(() => {
    if (customer && !initializedFromSession.current) {
      setReceiverName(customer.name);
      setReceiverPhone(customer.phone);
      initializedFromSession.current = true;
    }
  }, [customer]);

  const leadTime = items.length > 0
    ? Math.max(...items.map((i) => i.product.leadTimeDays))
    : 0;
  const minDate = getMinDeliveryDate(leadTime);
  const [deliveryDate, setDeliveryDate] = useState(minDate);

  const deliveryFee = DELIVERY_OPTIONS.find((d) => d.type === deliveryType)?.fee ?? 0;
  const total = subtotal + deliveryFee;

  const deliveryDescription = useMemo(() => {
    const opt = DELIVERY_OPTIONS.find((d) => d.type === deliveryType);
    const base = DELIVERY_LABELS[deliveryType].description;
    if (deliveryType === "ENTREGA_GRATIS" && opt?.distanceKm) {
      return `${base} · ${opt.distanceKm} km`;
    }
    if (deliveryType === "ENTREGA_APP") {
      return `Taxa estimada ${formatCurrency(deliveryFee)} · pago pelo cliente`;
    }
    return base;
  }, [deliveryType, deliveryFee]);

  const handleConfirm = async () => {
    if (isSubmitting || !customer) return;

    // KI-09: Validação de campos obrigatórios de endereço
    if (deliveryType !== "RETIRADA") {
      if (!street.trim() || !addressNumber.trim() || !neighborhood.trim() || !zipCode.trim()) {
        setSubmitError("Preencha todos os campos de endereço: Rua, Número, Bairro e CEP.");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createOrder({
        customerPhone: customer.phone,
        items,
        deliveryDate,
        deliveryType,
        deliveryFee,
        deliveryAddress: deliveryType !== "RETIRADA" ? {
          street,
          number: addressNumber,
          complement: complement || undefined,
          neighborhood,
          zipCode,
          city: "São Paulo",
          state: "SP",
        } : undefined,
        receiverName: deliveryType !== "RETIRADA" ? receiverName : undefined,
        receiverPhone: deliveryType !== "RETIRADA" ? receiverPhone : undefined,
        orderNotes,
        paymentMethod,
        subtotal,
        total,
      });

      setConfirmedOrderNumber(result.orderNumber);
      clearCart();
      setConfirmed(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erro ao confirmar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carrinho vazio
  if (items.length === 0 && !confirmed) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Checkout" />
        <div className="p-8 text-center">
          <p className="text-muted mb-4">Seu carrinho está vazio.</p>
          <Link href="/" className="font-semibold text-rose">
            Voltar à vitrine
          </Link>
        </div>
      </div>
    );
  }

  // Sessão ainda carregando
  if (sessionStatus === "loading") {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Finalizar pedido" />
        <div className="p-8 text-center text-muted text-sm">Carregando...</div>
      </div>
    );
  }

  // Cliente não autenticado
  if (!customer && !confirmed) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream">
        <HeaderMinimal title="Finalizar pedido" />
        <div className="p-8 text-center">
          <p className="text-muted mb-4">Faça login para confirmar seu pedido.</p>
          <Link
            href="/login?callbackUrl=/checkout"
            className="block rounded-xl bg-chocolate py-4 font-semibold text-white"
          >
            Entrar com meu celular
          </Link>
        </div>
      </div>
    );
  }

  // Pedido confirmado
  if (confirmed) {
    return (
      <div className="mx-auto min-h-screen max-w-app bg-cream p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-display text-2xl font-semibold mb-2">
          Pedido confirmado!
        </h1>
        {confirmedOrderNumber && (
          <p className="text-muted mb-2 text-sm font-semibold">
            Pedido #{confirmedOrderNumber}
          </p>
        )}
        <p className="text-muted mb-6">
          Você receberá uma confirmação no WhatsApp {customer?.phone}
        </p>
        <Link
          href="/pedidos"
          className="block rounded-xl bg-chocolate py-4 font-semibold text-white"
        >
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-app bg-cream pb-8 lg:max-w-5xl">
      <HeaderMinimal title="Finalizar pedido" />

      <div className="px-5 py-4 lg:flex lg:items-start lg:gap-8 lg:px-8 lg:py-8">
      <div className="lg:flex-1">
        <p className="text-muted mb-5 text-sm">
          Prazo mínimo deste pedido:{" "}
          <strong className="text-chocolate">
            {leadTime} {leadTime === 1 ? "dia" : "dias"}
          </strong>
        </p>

        <Field label="Data de entrega / retirada">
          <input
            type="date"
            value={deliveryDate}
            min={minDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="input-field"
          />
        </Field>

        <Field label="Como deseja receber?">
          <div className="space-y-2">
            {DELIVERY_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => setDeliveryType(opt.type)}
                className={`option-card w-full text-left ${
                  deliveryType === opt.type ? "selected" : ""
                }`}
              >
                <strong>{DELIVERY_LABELS[opt.type].title}</strong>
                <small className="text-muted block text-xs">
                  {opt.type === deliveryType
                    ? deliveryDescription
                    : DELIVERY_LABELS[opt.type].description}
                </small>
              </button>
            ))}
          </div>
        </Field>

        {deliveryType !== "RETIRADA" && (
          <>
            <Field label="Rua / Avenida *">
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Ex: Rua Augusta"
                className="input-field"
              />
            </Field>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Número *</label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  placeholder="123"
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">CEP *</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="00000-000"
                  className="input-field"
                />
              </div>
            </div>

            <Field label="Bairro *">
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Complemento (opcional)">
              <input
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Apto, bloco, referência..."
                className="input-field"
              />
            </Field>

            <Field label="Quem vai receber">
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="input-field"
              />
            </Field>

            <Field label="Telefone de quem recebe">
              <input
                type="tel"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="input-field"
              />
            </Field>
          </>
        )}

        <Field label="Observações do pedido">
          <textarea
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Instruções gerais, referências..."
            className="input-field min-h-[80px]"
          />
        </Field>

        <Field label="Fotos de referência">
          <div className="rounded-xl border-2 border-dashed border-sand p-6 text-center text-muted">
            <p>📷 Toque para enviar fotos</p>
            <p className="text-xs">JPG, PNG até 5 MB (em breve)</p>
          </div>
        </Field>

        <hr className="my-6 border-sand" />

        <h3 className="font-display mb-3 font-semibold">Itens</h3>
        {items.map((item) => (
          <div key={item.productId} className="mb-4">
            <p className="font-semibold text-sm">
              {item.product.name} × {item.quantity}
            </p>
            <textarea
              value={item.observation ?? ""}
              onChange={(e) => updateObservation(item.productId, e.target.value)}
              placeholder="Observação deste item"
              className="input-field mt-2 min-h-[60px] text-sm"
            />
          </div>
        ))}

        <Field label="Forma de pagamento">
          <div className="space-y-2">
            {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`option-card w-full text-left ${
                  paymentMethod === method ? "selected" : ""
                }`}
              >
                <strong>{PAYMENT_LABELS[method]}</strong>
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="lg:sticky lg:top-6 lg:w-96 lg:shrink-0">
        <div className="mt-5 rounded-xl bg-sand p-4 lg:mt-0">
          <Row label="Subtotal" value={formatCurrency(subtotal)} />
          <Row
            label="Entrega"
            value={deliveryFee === 0 ? "Grátis" : formatCurrency(deliveryFee)}
            muted
          />
          <Row label="Total" value={formatCurrency(total)} bold />
        </div>

        {submitError && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting || !customer}
          className="mt-5 w-full rounded-xl bg-chocolate py-4 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting
            ? "Confirmando…"
            : paymentMethod === "PIX_ONLINE"
              ? "Confirmar e pagar com PIX"
              : "Confirmar pedido"}
        </button>
      </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`mb-2 flex justify-between ${bold ? "text-lg font-bold" : ""} ${muted ? "text-muted text-sm" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
