"use client";

import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

/** `true` quando o item passa no filtro — nenhuma opção marcada = todos. */
export function matchesFilter<T extends string>(selected: T[], value: T | null | undefined): boolean {
  return selected.length === 0 || (value !== null && value !== undefined && selected.includes(value));
}

/** Filtro de status ativo/inativo (opções "active"/"inactive"): `undefined` =
 * todos (nenhuma ou as duas marcadas), senão o booleano para a API. */
export function activeParamFrom(selected: string[]): boolean | undefined {
  return selected.length === 1 ? selected[0] === "active" : undefined;
}

export const STATUS_FILTER_OPTIONS: FilterOption<"active" | "inactive">[] = [
  { value: "active", label: "Ativos" },
  { value: "inactive", label: "Inativos" },
];

/**
 * Filtro de listagem em dropdown com checkbox (01/10/2026) — padrão de todos os
 * filtros (status, tipo, categoria etc.) das telas de lista do admin. Várias
 * opções podem ser marcadas ao mesmo tempo; nenhuma marcada = todas. O menu
 * continua aberto ao marcar, para escolher várias de uma vez.
 */
export function MultiSelectFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
  allLabel = "Todos",
}: {
  label: string;
  options: FilterOption<T>[];
  selected: T[];
  onChange: (values: T[]) => void;
  allLabel?: string;
}) {
  const summary =
    selected.length === 0 || selected.length === options.length
      ? allLabel
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? allLabel
        : `${selected.length} selecionados`;
  const active = selected.length > 0 && selected.length < options.length;

  function toggle(value: T) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <DropdownMenuPrimitive.Root modal={false}>
        <DropdownMenuPrimitive.Trigger
          className={`flex h-10 w-full min-w-40 items-center justify-between gap-2 rounded-xl border px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate ${
            active ? "border-chocolate bg-chocolate/5 font-semibold text-chocolate" : "border-sand bg-white text-chocolate hover:bg-sand/40"
          }`}
          aria-label={`Filtrar por ${label}: ${summary}`}
        >
          <span className="truncate">{summary}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted" aria-hidden />
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 max-h-80 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-xl border border-sand bg-white p-1 shadow-card data-open:animate-in data-open:fade-in-0"
          >
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <DropdownMenuPrimitive.CheckboxItem
                  key={option.value}
                  checked={checked}
                  onCheckedChange={() => toggle(option.value)}
                  onSelect={(e) => e.preventDefault()}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-chocolate outline-none data-[highlighted]:bg-sand/50"
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                      checked ? "border-chocolate bg-chocolate text-white" : "border-sand bg-white"
                    }`}
                    aria-hidden
                  >
                    {checked && <CheckIcon className="size-3" />}
                  </span>
                  {option.label}
                </DropdownMenuPrimitive.CheckboxItem>
              );
            })}
            {selected.length > 0 && (
              <>
                <DropdownMenuPrimitive.Separator className="my-1 h-px bg-sand" />
                <DropdownMenuPrimitive.Item
                  onSelect={() => onChange([])}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-sm font-semibold text-muted outline-none data-[highlighted]:bg-sand/50"
                >
                  Limpar ({allLabel.toLowerCase()})
                </DropdownMenuPrimitive.Item>
              </>
            )}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}

/** Linha de filtros (dropdowns e "Ordenar por") lado a lado, quebrando no celular. */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">{children}</div>;
}
