"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Empty } from "@/components/ui/primitives";
import { formatCurrency, formatDate, maskAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export function RecentMovements({ limit = 7 }: { limit?: number }) {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const settings = useFinanceStore((s) => s.settings);

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Movimientos recientes</CardTitle>
          <CardSubtitle>Últimos registros</CardSubtitle>
        </div>
        <Link href="/movimientos" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
          Ver todos
        </Link>
      </CardHeader>

      {recent.length === 0 ? (
        <Empty title="Sin movimientos" description="Registra tu primer movimiento para empezar." />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {recent.map((t) => {
            const account = accounts.find((a) => a.id === t.accountId);
            const Icon = t.type === "income" ? ArrowUpRight : t.type === "expense" ? ArrowDownRight : ArrowLeftRight;
            const tone =
              t.type === "income"
                ? "bg-success/10 text-success-dark dark:text-success"
                : t.type === "expense"
                ? "bg-danger/10 text-danger-dark dark:text-danger"
                : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
            const amountStr = formatCurrency(t.amount, settings.currency, settings.locale);
            return (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition hover:bg-ink-50 dark:hover:bg-ink-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{t.name}</div>
                    <div className="text-[11px] text-ink-500 dark:text-ink-400">
                      {t.category} • {account?.name || "—"} • {formatDate(t.date)}
                    </div>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    t.type === "income"
                      ? "text-success-dark dark:text-success"
                      : t.type === "expense"
                      ? "text-ink-900 dark:text-ink-50"
                      : "text-ink-700 dark:text-ink-200"
                  )}
                >
                  {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                  {maskAmount(amountStr, settings.privacyMode)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
