"use client";

export interface SortOption {
  value: string;
  label: string;
}

/** Opções que toda listagem oferece (01/10/2026 — "Ordenar por" padronizado). */
export const NAME_SORT_OPTIONS: SortOption[] = [
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "name-desc", label: "Nome (Z–A)" },
];
export const RECENT_SORT_OPTION: SortOption = { value: "recent", label: "Mais recentes" };

/** Comparador de texto em pt-BR (ignora acento/caixa na ordem). */
export function compareText(a: string | null | undefined, b: string | null | undefined): number {
  return (a ?? "").localeCompare(b ?? "", "pt-BR", { sensitivity: "base" });
}

/**
 * Ordena uma cópia da lista segundo a chave escolhida no "Ordenar por".
 * `comparators` mapeia cada valor de opção para um comparador; chave
 * desconhecida mantém a ordem recebida.
 */
export function sortBy<T>(items: T[], sort: string, comparators: Record<string, (a: T, b: T) => number>): T[] {
  const compare = comparators[sort];
  return compare ? [...items].sort(compare) : items;
}

/** "Ordenar por" padrão das listagens do admin — mesmo visual dos filtros. */
export function SortSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor="list-sort" className="mb-1.5 block text-xs font-medium text-muted">
        Ordenar por
      </label>
      <select
        id="list-sort"
        className="h-10 w-full min-w-44 rounded-xl border border-sand bg-white px-3 text-sm text-chocolate focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
