// CSV import / export for transactions.

import type { Transaction, TransactionType } from "@/types/finance";
import { nowISO, uid } from "./utils";

const HEADERS = [
  "id",
  "type",
  "name",
  "amount",
  "date",
  "category",
  "subcategory",
  "accountId",
  "paymentMethod",
  "isRecurring",
  "isFixed",
  "tags",
  "notes",
] as const;

function escapeCSV(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function transactionsToCSV(tx: Transaction[]): string {
  const lines = [HEADERS.join(",")];
  for (const t of tx) {
    lines.push(
      [
        t.id,
        t.type,
        t.name,
        t.amount,
        t.date,
        t.category,
        t.subcategory || "",
        t.accountId || "",
        t.paymentMethod || "",
        t.isRecurring ? "true" : "false",
        t.isFixed ? "true" : "false",
        (t.tags || []).join("|"),
        t.notes || "",
      ]
        .map(escapeCSV)
        .join(",")
    );
  }
  return lines.join("\n");
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inside = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inside && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inside = !inside;
      }
    } else if (c === "," && !inside) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function csvToTransactions(csv: string): Transaction[] {
  const lines = csv.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (key: string) => headers.indexOf(key);
  const result: Transaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const get = (k: string) => (idx(k) >= 0 ? cols[idx(k)] : "");
    const type = (get("type") || "expense").toLowerCase() as TransactionType;
    const amount = Number(get("amount")) || 0;
    const t: Transaction = {
      id: get("id") || uid("tx"),
      type,
      name: get("name") || "Sin nombre",
      amount,
      date: get("date") || new Date().toISOString().slice(0, 10),
      category: get("category") || "Otros",
      subcategory: get("subcategory") || undefined,
      accountId: get("accountid") || undefined,
      paymentMethod: get("paymentmethod") || undefined,
      isRecurring: get("isrecurring") === "true",
      isFixed: get("isfixed") === "true",
      tags: get("tags") ? get("tags").split("|").filter(Boolean) : undefined,
      notes: get("notes") || undefined,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    if (t.amount > 0) result.push(t);
  }
  return result;
}

export function downloadFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
