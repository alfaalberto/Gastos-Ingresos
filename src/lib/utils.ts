import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

// Formats a Date as YYYY-MM-DD using LOCAL time (never UTC).
// Using toISOString() here would shift the day in negative UTC offsets (e.g. Mexico).
export function toISODateLocal(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayISODate(): string {
  return toISODateLocal(new Date());
}

// Parses "YYYY-MM-DD" as a LOCAL date. `new Date("YYYY-MM-DD")` parses as UTC
// midnight, which renders as the previous day in UTC-negative timezones.
export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

export function monthKey(date: string | Date): string {
  if (typeof date === "string" && /^\d{4}-\d{2}/.test(date)) return date.slice(0, 7);
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}`;
}

export function inSameMonth(a: string, b: string): boolean {
  return monthKey(a) === monthKey(b);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function safeDiv(a: number, b: number): number {
  if (!b || !isFinite(b)) return 0;
  return a / b;
}

export function pct(value: number, total: number): number {
  return clamp(safeDiv(value, total) * 100, 0, 100);
}

export function isClient(): boolean {
  return typeof window !== "undefined";
}
