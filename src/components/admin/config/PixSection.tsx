"use client";

import { Field, Section, inputClass, type FormSetter } from "@/components/admin/config/FormPrimitives";
import { getPixPlaceholder } from "@/lib/formatters/pix";
import type { PixKeyType } from "@/lib/types";
import { PIX_KEY_TYPE_LABELS } from "@/lib/types";

interface PixSectionProps {
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  fieldErrors: Record<string, string>;
  disabled: boolean;
  onFieldChange: FormSetter;
}

function PixPreview({
  pixKeyType,
  pixKey,
}: {
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
}) {
  if (!pixKeyType || !pixKey) return null;
  return (
    <div className="mt-3 rounded-xl border border-sand bg-sand/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Pré-visualização do PIX
      </p>
      <p className="mt-1 text-sm text-chocolate">
        <span className="font-medium">{PIX_KEY_TYPE_LABELS[pixKeyType]}:</span>{" "}
        <span className="font-mono">{pixKey}</span>
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Exibido ao cliente no checkout ao selecionar &quot;PIX na entrega&quot;.
      </p>
    </div>
  );
}

export function PixSection({
  pixKeyType,
  pixKey,
  fieldErrors,
  disabled,
  onFieldChange,
}: PixSectionProps) {
  return (
    <Section title="PIX">
      <Field label="Tipo de chave PIX" error={fieldErrors.pixKeyType}>
        <select
          className={inputClass("pixKeyType", fieldErrors)}
          value={pixKeyType ?? ""}
          onChange={(e) =>
            onFieldChange("pixKeyType", (e.target.value as PixKeyType) || null)
          }
          disabled={disabled}
        >
          <option value="">— Não configurado —</option>
          {(Object.keys(PIX_KEY_TYPE_LABELS) as PixKeyType[]).map((k) => (
            <option key={k} value={k}>
              {PIX_KEY_TYPE_LABELS[k]}
            </option>
          ))}
        </select>
      </Field>

      {pixKeyType && (
        <Field label="Chave PIX" error={fieldErrors.pixKey}>
          <input
            className={inputClass("pixKey", fieldErrors)}
            value={pixKey ?? ""}
            onChange={(e) => onFieldChange("pixKey", e.target.value || null)}
            disabled={disabled}
            placeholder={getPixPlaceholder(pixKeyType)}
          />
        </Field>
      )}

      <PixPreview pixKeyType={pixKeyType} pixKey={pixKey} />
    </Section>
  );
}
