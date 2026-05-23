// Formatting utilities for currency, dates, numbers, and percentages.

export function formatCurrency(
  amount: number,
  currency = "MXN",
  locale = "es-MX",
  options: Intl.NumberFormatOptions = {}
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
      ...options,
    }).format(isFinite(amount) ? amount : 0);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatCompact(amount: number, locale = "es-MX"): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch {
    return amount.toString();
  }
}

export function formatNumber(value: number, locale = "es-MX", digits = 0): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(isFinite(value) ? value : 0);
}

export function formatPercent(value: number, digits = 1): string {
  if (!isFinite(value)) return "0%";
  return `${value.toFixed(digits)}%`;
}

const SHORT_MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const LONG_MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const dd = `${d.getDate()}`.padStart(2, "0");
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const yyyy = `${d.getFullYear()}`;
  return pattern
    .replace("yyyy", yyyy)
    .replace("MM", mm)
    .replace("dd", dd);
}

export function formatDateLong(date: string | Date, locale = "es-MX"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} de ${LONG_MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function shortMonth(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return SHORT_MONTHS_ES[d.getMonth()];
}

export function monthYearLabel(monthKey: string): string {
  // monthKey: YYYY-MM
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  return `${LONG_MONTHS_ES[m - 1]} ${y}`;
}

export function maskAmount(text: string, privacy: boolean): string {
  if (!privacy) return text;
  return text.replace(/[0-9]/g, "•");
}
