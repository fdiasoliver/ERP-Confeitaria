"use client";

import { Field, Section, inputClass, type FormSetter } from "@/components/admin/config/FormPrimitives";
import type { StoreConfigInput } from "@/lib/types";

type PricingFields = Pick<
  StoreConfigInput,
  "laborCostPerHour" | "fixedCostMonthly" | "monthlyProductionUnits" | "monthlyProductionMinutes" | "targetMarginPercent"
>;

interface PricingSectionProps {
  form: PricingFields;
  fieldErrors: Record<string, string>;
  disabled: boolean;
  onFieldChange: FormSetter;
}

export function PricingSection({
  form,
  fieldErrors,
  disabled,
  onFieldChange,
}: PricingSectionProps) {
  return (
    <Section title="Precificação">
      <Field
        label="Custo de mão de obra (R$/hora)"
        required
        error={fieldErrors.laborCostPerHour}
      >
        <input
          type="number"
          className={inputClass("laborCostPerHour", fieldErrors)}
          value={form.laborCostPerHour}
          onChange={(e) => onFieldChange("laborCostPerHour", parseFloat(e.target.value) || 0)}
          min={0}
          step={0.01}
          disabled={disabled}
        />
      </Field>

      <Field
        label="Custos fixos mensais (R$)"
        required
        error={fieldErrors.fixedCostMonthly}
      >
        <input
          type="number"
          className={inputClass("fixedCostMonthly", fieldErrors)}
          value={form.fixedCostMonthly}
          onChange={(e) => onFieldChange("fixedCostMonthly", parseFloat(e.target.value) || 0)}
          min={0}
          step={0.01}
          disabled={disabled}
        />
      </Field>

      <Field
        label="Produção mensal estimada (unidades)"
        required
        error={fieldErrors.monthlyProductionUnits}
      >
        <input
          type="number"
          className={inputClass("monthlyProductionUnits", fieldErrors)}
          value={form.monthlyProductionUnits}
          onChange={(e) =>
            onFieldChange("monthlyProductionUnits", parseInt(e.target.value) || 1)
          }
          min={1}
          step={1}
          disabled={disabled}
        />
      </Field>

      <Field
        label="Capacidade produtiva mensal (minutos)"
        required
        error={fieldErrors.monthlyProductionMinutes}
      >
        <input
          type="number"
          className={inputClass("monthlyProductionMinutes", fieldErrors)}
          value={form.monthlyProductionMinutes}
          onChange={(e) =>
            onFieldChange("monthlyProductionMinutes", parseInt(e.target.value) || 1)
          }
          min={1}
          step={1}
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-muted">
          Total de minutos de preparo disponíveis por mês — usado para ratear o custo fixo proporcionalmente ao
          tempo de cada produto.
        </p>
      </Field>

      <Field label="Margem de lucro alvo (%)" required error={fieldErrors.targetMarginPercent}>
        <input
          type="number"
          className={inputClass("targetMarginPercent", fieldErrors)}
          value={form.targetMarginPercent}
          onChange={(e) =>
            onFieldChange("targetMarginPercent", parseFloat(e.target.value) || 0)
          }
          min={0}
          max={100}
          step={0.1}
          disabled={disabled}
        />
      </Field>
    </Section>
  );
}
