export function formatDate(dateString: string): string {
  // Append T12:00:00 to avoid UTC midnight → previous day in UTC-3
  return new Date(dateString + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}
