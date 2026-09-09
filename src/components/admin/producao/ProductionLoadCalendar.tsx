"use client";

import type { ProductionLoadDayDTO } from "@/lib/api/orderAdminApi";

const WEEKDAY_HEADERS = ["D", "S", "T", "Q", "Q", "S", "S"];

function loadColorClass(day: ProductionLoadDayDTO): string {
  if (day.orderCount === 0) return "bg-sand/40 text-muted";
  if (day.isOverloaded) return "bg-rose/15 text-rose";
  return "bg-sage/15 text-sage";
}

function DayCell({
  day,
  selected,
  showWeekday,
  onSelect,
}: {
  day: ProductionLoadDayDTO;
  selected: boolean;
  showWeekday: boolean;
  onSelect: () => void;
}) {
  const date = new Date(`${day.date}T12:00:00`);
  const dayNumber = date.getDate();
  const weekdayShort = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}: ${day.orderCount} pedido${day.orderCount !== 1 ? "s" : ""}${day.isOverloaded ? " — carga acima do normal" : ""}`}
      className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${loadColorClass(day)} ${
        selected ? "ring-2 ring-chocolate ring-offset-1" : "hover:opacity-80"
      }`}
    >
      {showWeekday && <span className="text-[9px] font-semibold uppercase">{weekdayShort}</span>}
      <span className="text-sm font-bold">{dayNumber}</span>
      {day.orderCount > 0 && <span className="text-[10px] font-semibold">{day.orderCount}</span>}
    </button>
  );
}

/** Calendário de carga de produção (P3.3) — cada dia mostra a contagem de
 * pedidos (RASCUNHO/CANCELADO excluídos, orderService.getProductionLoad) com
 * cor indicando sobrecarga. Clicar num dia seleciona a data — o Kanban
 * detalhado daquele dia é renderizado pela página (reaproveita o mesmo
 * carregamento de "Hoje"/"Amanhã", só troca a data). */
export function ProductionLoadCalendar({
  days,
  selectedDate,
  onSelectDate,
  layout,
}: {
  days: ProductionLoadDayDTO[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  layout: "week" | "month";
}) {
  if (days.length === 0) return null;

  if (layout === "week") {
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <DayCell key={day.date} day={day} selected={day.date === selectedDate} showWeekday onSelect={() => onSelectDate(day.date)} />
        ))}
      </div>
    );
  }

  const firstDate = new Date(`${days[0].date}T12:00:00`);
  const leadingBlanks = firstDate.getDay();
  const cells: (ProductionLoadDayDTO | null)[] = [...Array(leadingBlanks).fill(null), ...days];

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase text-muted">
        {WEEKDAY_HEADERS.map((w, i) => <span key={i}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, i) =>
          day ? (
            <DayCell key={day.date} day={day} selected={day.date === selectedDate} showWeekday={false} onSelect={() => onSelectDate(day.date)} />
          ) : (
            <div key={`blank-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
