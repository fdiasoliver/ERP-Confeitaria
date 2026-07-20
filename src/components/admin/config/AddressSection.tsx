"use client";

import { Field, Section, inputClass, type FormSetter } from "@/components/admin/config/FormPrimitives";
import { maskCEP } from "@/lib/formatters/cep";
import type { StoreConfigInput } from "@/lib/types";

type AddressFields = Pick<
  StoreConfigInput,
  | "addressZip"
  | "addressStreet"
  | "addressNumber"
  | "addressComplement"
  | "addressNeighborhood"
  | "addressCity"
  | "addressState"
>;

interface AddressSectionProps {
  form: AddressFields;
  ibgeCode: string | null;
  fieldErrors: Record<string, string>;
  disabled: boolean;
  cepLoading: boolean;
  onFieldChange: FormSetter;
  onLookupCEP: (cep: string) => void;
}

export function AddressSection({
  form,
  ibgeCode,
  fieldErrors,
  disabled,
  cepLoading,
  onFieldChange,
  onLookupCEP,
}: AddressSectionProps) {
  const busy = disabled || cepLoading;

  return (
    <Section title="Endereço">
      <Field label="CEP" error={fieldErrors.addressZip}>
        <div className="flex gap-2">
          <input
            className={`${inputClass("addressZip", fieldErrors)} flex-1`}
            value={form.addressZip ?? ""}
            onChange={(e) => onFieldChange("addressZip", maskCEP(e.target.value) || null)}
            onBlur={() => form.addressZip && onLookupCEP(form.addressZip)}
            disabled={busy}
            placeholder="00000-000"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={() => form.addressZip && onLookupCEP(form.addressZip)}
            disabled={busy || !form.addressZip}
            className="shrink-0 rounded-[10px] border border-chocolate px-3 py-2 text-sm font-medium text-chocolate disabled:opacity-40"
          >
            {cepLoading ? "…" : "Buscar"}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Logradouro" error={fieldErrors.addressStreet}>
            <input
              className={inputClass("addressStreet", fieldErrors)}
              value={form.addressStreet ?? ""}
              onChange={(e) => onFieldChange("addressStreet", e.target.value || null)}
              disabled={busy}
              placeholder="Rua das Flores"
            />
          </Field>
        </div>
        <Field label="Número" error={fieldErrors.addressNumber}>
          <input
            className={inputClass("addressNumber", fieldErrors)}
            value={form.addressNumber ?? ""}
            onChange={(e) => onFieldChange("addressNumber", e.target.value || null)}
            disabled={busy}
            placeholder="123"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bairro" error={fieldErrors.addressNeighborhood}>
          <input
            className={inputClass("addressNeighborhood", fieldErrors)}
            value={form.addressNeighborhood ?? ""}
            onChange={(e) => onFieldChange("addressNeighborhood", e.target.value || null)}
            disabled={busy}
            placeholder="Jardim Europa"
          />
        </Field>
        <Field label="Complemento">
          <input
            className="input-field"
            value={form.addressComplement ?? ""}
            onChange={(e) => onFieldChange("addressComplement", e.target.value || null)}
            disabled={disabled}
            placeholder="Sala 3, Bloco B"
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Cidade" error={fieldErrors.addressCity}>
            <input
              className={inputClass("addressCity", fieldErrors)}
              value={form.addressCity}
              onChange={(e) => onFieldChange("addressCity", e.target.value)}
              disabled={busy}
            />
          </Field>
        </div>
        <Field label="UF">
          <input
            className="input-field uppercase"
            value={form.addressState}
            onChange={(e) =>
              onFieldChange("addressState", e.target.value.toUpperCase().slice(0, 2))
            }
            disabled={busy}
            maxLength={2}
          />
        </Field>
      </div>

      {ibgeCode && (
        <div>
          <p className="text-sm font-medium text-chocolate">Código IBGE</p>
          <p className="mt-1 rounded-[10px] border border-sand bg-sand px-3 py-2 text-sm text-muted">
            {ibgeCode}{" "}
            <span className="text-xs">(preenchido automaticamente via CEP)</span>
          </p>
        </div>
      )}
    </Section>
  );
}
