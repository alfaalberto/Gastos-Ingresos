"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Coffee, Plus, TrendingDown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { KpiCard, Badge } from "@/components/ui/primitives";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { useFinanceStore } from "@/store/financeStore";
import { detectAntExpenses, expensesByCategory, recurringSubscriptions, topCategories } from "@/lib/calculations";
import { formatCurrency, maskAmount } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";

export default function GastosPage() {
  const { transactions, settings } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const mKey = monthKey(todayISODate());

  const data = useMemo(() => {
    const byCat = expensesByCategory(transactions, mKey);
    const total = Object.values(byCat).reduce((a, b) => a + b, 0);
    const top = topCategories(transactions, mKey, 5);
    const ants = detectAntExpenses(transactions, mKey);
    const subs = recurringSubscriptions(transactions).filter((t) => monthKey(t.date) === mKey);
    const subsTotal = subs.reduce((a, b) => a + b.amount, 0);
    return { total, top, ants, subs, subsTotal };
  }, [transactions, mKey]);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, settings.currency, settings.locale, { maximumFractionDigits: 0 }), settings.privacyMode);

  return (
    <AppShell title="Gastos" subtitle="Identifica fugas, hábitos y categorías costosas">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            label="Gastos del mes"
            value={fmt(data.total)}
            icon={<TrendingDown className="h-4 w-4" />}
            accent="danger"
          />
          <KpiCard
            label="Gastos hormiga"
            value={fmt(data.ants.total)}
            hint={`${data.ants.count} micro-gastos detectados`}
            icon={<Coffee className="h-4 w-4" />}
            accent="warning"
          />
          <KpiCard
            label="Suscripciones"
            value={fmt(data.subsTotal)}
            hint={`${data.subs.length} activas`}
            icon={<AlertTriangle className="h-4 w-4" />}
            accent="gold"
          />
          <KpiCard
            label="Top categoría"
            value={data.top[0]?.category || "—"}
            hint={data.top[0] ? fmt(data.top[0].total) : "Sin datos"}
            accent="brand"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ranking de categorías</CardTitle>
                <CardSubtitle>Top 5 con mayor gasto este mes</CardSubtitle>
              </div>
            </CardHeader>
            <ul className="flex flex-col gap-2">
              {data.top.length === 0 ? (
                <li className="text-sm text-ink-500">Sin gastos registrados.</li>
              ) : (
                data.top.map((c, i) => (
                  <li key={c.category} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-ink-50 dark:hover:bg-ink-800/40">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 text-xs font-semibold text-ink-700 dark:bg-ink-800 dark:text-ink-200">
                        {i + 1}
                      </span>
                      <span className="font-medium text-ink-800 dark:text-ink-100">{c.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-ink-900 dark:text-ink-50">{fmt(c.total)}</div>
                      <div className="text-[10px] text-ink-500">
                        {((c.total / data.total) * 100).toFixed(0)}% del total
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  <span className="inline-flex items-center gap-1.5">
                    <Coffee className="h-4 w-4 text-warn" /> Gastos hormiga
                  </span>
                </CardTitle>
                <CardSubtitle>Micro-gastos {"<="} $80 que se acumulan</CardSubtitle>
              </div>
            </CardHeader>
            {data.ants.items.length === 0 ? (
              <p className="text-sm text-ink-500">Sin gastos hormiga este mes. ¡Bien hecho!</p>
            ) : (
              <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
                {data.ants.items.slice(0, 12).map((t) => (
                  <li key={t.id} className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-ink-800 dark:text-ink-100">{t.name}</div>
                      <div className="text-[10px] text-ink-500">{t.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-ink-900 dark:text-ink-50">{fmt(t.amount)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Suscripciones activas</CardTitle>
                <CardSubtitle>Gastos recurrentes mensuales</CardSubtitle>
              </div>
            </CardHeader>
            {data.subs.length === 0 ? (
              <p className="text-sm text-ink-500">Sin suscripciones detectadas.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.subs.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                      <span className="text-ink-700 dark:text-ink-200">{s.name}</span>
                    </div>
                    <span className="font-semibold text-ink-900 dark:text-ink-50">{fmt(s.amount)}</span>
                  </li>
                ))}
                <li className="mt-2 flex items-center justify-between border-t border-ink-100 pt-2 text-sm dark:border-ink-800">
                  <Badge variant="info">Total</Badge>
                  <span className="font-semibold text-ink-900 dark:text-ink-50">{fmt(data.subsTotal)}</span>
                </li>
              </ul>
            )}
          </Card>
        </div>

        <div className="flex justify-end">
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Registrar gasto
          </Button>
        </div>

        <TransactionsTable
          defaultType="expense"
          hideTypeFilter
          title="Tus gastos"
          subtitle="Desde la renta hasta un chicle — todo cuenta"
        />

        <Modal open={open} onClose={() => setOpen(false)} title="Registrar gasto" size="lg">
          <TransactionForm defaultType="expense" onClose={() => setOpen(false)} />
        </Modal>
      </div>
    </AppShell>
  );
}
