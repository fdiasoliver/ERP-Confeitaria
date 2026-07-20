export function FilterChips<T extends string>({ label, options, selected, onSelect }: {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={selected === opt.value}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chocolate ${
              selected === opt.value
                ? "border-chocolate bg-chocolate text-white"
                : "border-sand bg-white text-chocolate hover:bg-sand/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
