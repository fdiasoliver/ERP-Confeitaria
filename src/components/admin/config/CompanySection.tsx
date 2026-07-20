"use client";

import { Field, Section, inputClass, type FormSetter, type FieldErrorSetter } from "@/components/admin/config/FormPrimitives";
import { maskCNPJ } from "@/lib/formatters/cnpj";
import { maskPhone } from "@/lib/formatters/phone";
import { rawDigits } from "@/lib/formatters/cep";
import type { StoreConfigInput } from "@/lib/types";

type CompanyFields = Pick<
  StoreConfigInput,
  "name" | "legalName" | "cnpj" | "instagram" | "phone" | "email"
>;

interface CompanySectionProps {
  form: CompanyFields;
  fieldErrors: Record<string, string>;
  disabled: boolean;
  onFieldChange: FormSetter;
  onFieldError: FieldErrorSetter;
}

export function CompanySection({
  form,
  fieldErrors,
  disabled,
  onFieldChange,
  onFieldError,
}: CompanySectionProps) {
  return (
    <>
      <Section title="Identificação">
        <Field label="Nome da empresa" required error={fieldErrors.name}>
          <input
            className={inputClass("name", fieldErrors)}
            value={form.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            onBlur={() => {
              if (!form.name.trim())
                onFieldError("name", "Nome da empresa é obrigatório.");
            }}
            maxLength={100}
            disabled={disabled}
            placeholder="Doce Menina"
          />
        </Field>

        <Field label="Razão social" error={fieldErrors.legalName}>
          <input
            className={inputClass("legalName", fieldErrors)}
            value={form.legalName ?? ""}
            onChange={(e) => onFieldChange("legalName", e.target.value || null)}
            disabled={disabled}
            placeholder="Doce Menina LTDA"
          />
        </Field>

        <Field label="CNPJ" error={fieldErrors.cnpj}>
          <input
            className={inputClass("cnpj", fieldErrors)}
            value={form.cnpj ?? ""}
            onChange={(e) => onFieldChange("cnpj", maskCNPJ(e.target.value) || null)}
            onBlur={() => {
              if (form.cnpj && rawDigits(form.cnpj).length !== 14)
                onFieldError("cnpj", "CNPJ deve ter 14 dígitos.");
            }}
            disabled={disabled}
            placeholder="00.000.000/0001-00"
            inputMode="numeric"
          />
        </Field>

        <Field label="Instagram" error={fieldErrors.instagram}>
          <input
            className={inputClass("instagram", fieldErrors)}
            value={form.instagram ?? ""}
            onChange={(e) => onFieldChange("instagram", e.target.value || null)}
            disabled={disabled}
            placeholder="@doceatelier"
          />
        </Field>
      </Section>

      <Section title="Contato">
        <Field label="Telefone / WhatsApp" error={fieldErrors.phone}>
          <input
            className={inputClass("phone", fieldErrors)}
            value={form.phone ?? ""}
            onChange={(e) => onFieldChange("phone", maskPhone(e.target.value) || null)}
            onBlur={() => {
              if (form.phone) {
                const d = rawDigits(form.phone);
                if (d.length < 10 || d.length > 11)
                  onFieldError("phone", "Telefone inválido. Use DDD + número.");
              }
            }}
            disabled={disabled}
            placeholder="(11) 99999-9999"
            inputMode="tel"
          />
        </Field>

        <Field label="E-mail" error={fieldErrors.email}>
          <input
            type="email"
            className={inputClass("email", fieldErrors)}
            value={form.email ?? ""}
            onChange={(e) => onFieldChange("email", e.target.value || null)}
            onBlur={() => {
              if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                onFieldError("email", "E-mail inválido.");
            }}
            disabled={disabled}
            placeholder="contato@doceatelier.com.br"
          />
        </Field>
      </Section>
    </>
  );
}
