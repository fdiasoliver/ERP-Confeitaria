"use client";

import { useState, useEffect, useCallback } from "react";
import { HeaderMinimal } from "@/components/layout/Header";
import { toast } from "sonner";
import { validateStoreConfig } from "@/lib/validators/storeConfig";
import { rawDigits } from "@/lib/formatters/cep";
import { lookupCEP, CepNotFoundError } from "@/lib/address/ViaCepService";
import type { StoreConfig, StoreConfigInput, ValidationError } from "@/lib/types";
import { BrandSection } from "@/components/admin/config/BrandSection";
import { CompanySection } from "@/components/admin/config/CompanySection";
import { AddressSection } from "@/components/admin/config/AddressSection";
import { DeliverySection } from "@/components/admin/config/DeliverySection";
import { PixSection } from "@/components/admin/config/PixSection";
import { PricingSection } from "@/components/admin/config/PricingSection";
import { ActionBar } from "@/components/admin/config/ActionBar";
import { LoadingSkeleton } from "@/components/admin/config/LoadingSkeleton";
import { EMPTY_INPUT, configToInput } from "@/app/admin/config/configHelpers";

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<StoreConfigInput>(EMPTY_INPUT);
  const [ibgeCode, setIbgeCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data: StoreConfig) => {
        setForm(configToInput(data));
        setIbgeCode(data.ibgeCode);
      })
      .catch(() => toast.error("Erro ao carregar configurações."))
      .finally(() => setLoading(false));
  }, []);

  function setField<K extends keyof StoreConfigInput>(key: K, value: StoreConfigInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }

  function setFieldError(field: string, message: string | null) {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message === null) delete next[field]; else next[field] = message;
      return next;
    });
  }

  const handleLookupCEP = useCallback(async (cep: string) => {
    if (rawDigits(cep).length !== 8) return;
    setCepLoading(true);
    try {
      const result = await lookupCEP(cep);
      setForm((prev) => ({
        ...prev,
        addressStreet: result.street ?? prev.addressStreet,
        addressNeighborhood: result.neighborhood ?? prev.addressNeighborhood,
        addressCity: result.city ?? prev.addressCity,
        addressState: result.state ?? prev.addressState,
      }));
      if (result.ibgeCode) setIbgeCode(result.ibgeCode);
      setFieldError("addressZip", null);
    } catch (err) {
      if (err instanceof CepNotFoundError)
        setFieldError("addressZip", "CEP não encontrado.");
    } finally {
      setCepLoading(false);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateStoreConfig(form);
    if (errors.length > 0) {
      const map: Record<string, string> = {};
      errors.forEach((err: ValidationError) => { map[err.field] = err.message; });
      setFieldErrors(map);
      toast.error("Corrija os campos destacados antes de salvar.");
      return;
    }
    setSubmitting(true);
    const toastId = toast.loading("Salvando configurações…");
    const payload: StoreConfigInput = {
      ...form,
      cnpj: form.cnpj ? rawDigits(form.cnpj) : null,
      phone: form.phone ? rawDigits(form.phone) : null,
      addressZip: form.addressZip ? rawDigits(form.addressZip) : null,
    };
    const res = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      if (res.status === 400 && data.errors) {
        const map: Record<string, string> = {};
        (data.errors as ValidationError[]).forEach((err) => { map[err.field] = err.message; });
        setFieldErrors(map);
        toast.error("Corrija os campos destacados.", { id: toastId });
      } else {
        toast.error(data.error ?? "Erro ao salvar.", { id: toastId });
      }
      return;
    }
    toast.success("Configurações salvas.", { id: toastId });
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-cream pb-28">
      <HeaderMinimal title="Configurações" />
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4 p-5">
          <BrandSection
            logoUrl={form.logoUrl}
            faviconUrl={form.faviconUrl}
            disabled={submitting}
            onLogoChange={(url) => setField("logoUrl", url)}
            onFaviconChange={(url) => setField("faviconUrl", url)}
          />
          <CompanySection
            form={form}
            fieldErrors={fieldErrors}
            disabled={submitting}
            onFieldChange={setField}
            onFieldError={setFieldError}
          />
          <AddressSection
            form={form}
            ibgeCode={ibgeCode}
            fieldErrors={fieldErrors}
            disabled={submitting}
            cepLoading={cepLoading}
            onFieldChange={setField}
            onLookupCEP={handleLookupCEP}
          />
          <DeliverySection
            value={form.freeDeliveryRadiusKm}
            error={fieldErrors.freeDeliveryRadiusKm}
            disabled={submitting}
            onChange={(v) => setField("freeDeliveryRadiusKm", v)}
          />
          <PixSection
            pixKeyType={form.pixKeyType}
            pixKey={form.pixKey}
            fieldErrors={fieldErrors}
            disabled={submitting}
            onFieldChange={setField}
          />
          <PricingSection
            form={form}
            fieldErrors={fieldErrors}
            disabled={submitting}
            onFieldChange={setField}
          />
        </div>
        <ActionBar submitting={submitting} />
      </form>
    </div>
  );
}
