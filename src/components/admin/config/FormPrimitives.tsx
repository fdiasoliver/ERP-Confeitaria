"use client";

import type { StoreConfigInput } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useInEntityForm } from "@/components/admin/shared/EntityForm";

export type FormSetter = <K extends keyof StoreConfigInput>(
  key: K,
  value: StoreConfigInput[K],
) => void;

export type FieldErrorSetter = (field: string, message: string | null) => void;

export function Field({
  label,
  required,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  /** Classes extras no wrapper — ex.: `md:col-span-2` para ocupar a linha toda no EntityForm de 2 colunas. */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1 text-sm font-medium text-chocolate">
        {label}
        {required && <span className="ml-0.5 text-rose">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  );
}

export function inputClass(field: string, errors: Record<string, string>): string {
  return `input-field ${errors[field] ? "border-rose focus:outline-none" : ""}`;
}

export function Section({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const inEntityForm = useInEntityForm();
  // Dentro do EntityForm (tela cheia, já num card branco): bloco com borda,
  // sem card próprio — evita card dentro de card.
  if (inEntityForm) {
    return (
      <section className={`rounded-xl border border-sand p-4${className ? ` ${className}` : ""}`}>
        <h2 className="font-display mb-4 text-base font-semibold text-chocolate">{title}</h2>
        <div className="space-y-4">{children}</div>
      </section>
    );
  }
  return (
    <Card className={`shadow-card gap-0 rounded-2xl p-5${className ? ` ${className}` : ""}`}>
      <h2 className="font-display mb-4 text-base font-semibold text-chocolate">{title}</h2>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
