"use client";

import type { StoreConfigInput } from "@/lib/types";

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
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-chocolate">
        {label}
        {required && <span className="ml-0.5 text-rose">*</span>}
      </label>
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shadow-card rounded-2xl bg-white p-5">
      <h2 className="font-display mb-4 text-base font-semibold text-chocolate">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
