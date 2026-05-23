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

export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
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
