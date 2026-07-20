"use client";

import { Field, Section, inputClass } from "@/components/admin/config/FormPrimitives";

interface DeliverySectionProps {
  value: number;
  error?: string;
  disabled: boolean;
  onChange: (value: number) => void;
}

export function DeliverySection({ value, error, disabled, onChange }: DeliverySectionProps) {
  const errors: Record<string, string> = error ? { freeDeliveryRadiusKm: error } : {};
  return (
    <Section title="Entrega">
      <Field label="Raio de entrega gratuita (km)" required error={error}>
        <input
          type="number"
          className={inputClass("freeDeliveryRadiusKm", errors)}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={0}
          max={50}
          step={0.5}
          disabled={disabled}
        />
      </Field>
    </Section>
  );
}
