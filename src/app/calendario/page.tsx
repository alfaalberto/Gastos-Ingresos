"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Badge, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatDateLong, maskAmount, monthYearLabel } from "@/lib/formatters";
import { monthKey } from "@/lib/utils";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export default function CalendarioPage() {
  const { transactions, debts, settings } = useFinanceStore();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, settings.currency, settings.locale, { maximumFractionDigits: 0 }), settings.privacyMode);

  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const mKey = monthKey(cursor);

  // Build calendar grid (Mon-first)
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    const dayIdx = (firstDay.getDay() + 6) % 7; // Mon=0, Sun=6
    start.setDate(firstDay.getDate() - dayIdx);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
      if (cells.length >= 42 && d.getMonth() > month) break;
    }
    return cells;
  }, [year, month]);

  // Index transactions by date string
  const txByDate = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {};
    for (const t of transactions) {
      const k = t.date;
      if (!map[k]) map[k] = { income: 0, expense: 0, count: 0 };
      if (t.type === "income") map[k].income += t.amount;
      else if (t.type === "expense") map[k].expense += t.amount;
      map[k].count++;
    }
    return map;
  }, [transactions]);

  // Debt due dates
  const debtByDate = useMemo(() => {
    const map: Record<string, typeof debts> = {};
    for (const d of debts) {
      if (!map[d.dueDate]) map[d.dueDate] = [];
      (map[d.dueDate] as any).push(d);
    }
    return map;
  }, [debts]);

  // Max spend for heatmap intensity (current month)
  const maxSpend = useMemo(() => {
    let max = 0;
    for (const [date, info] of Object.entries(txByDate)) {
      if (monthKey(date) === mKey) max = Math.max(max, info.expense);
    }
    return max;
  }, [txByDate, mKey]);

  const selectedDay = selectedDate;
  const selectedTx = transactions.filter((t) => t.date === selectedDay);
  const selectedDebts = selectedDay ? debtByDate[selectedDay] || [] : [];

  return (
    <AppShell title="Calendario financiero" subtitle="Visualiza ingresos, gastos y pagos próximos">
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> {monthYearLabel(mKey)}
                </span>
              </CardTitle>
              <CardSubtitle>Haz clic en un día para ver los movimientos</CardSubtitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Mes anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
                Hoy
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Mes siguiente">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-ink-500 dark:text-ink-400">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {grid.map((d) => {
              const iso = d.toISOString().slice(0, 10);
              const otherMonth = d.getMonth() !== month;
              const isToday = iso === new Date().toISOString().slice(0, 10);
              const data = txByDate[iso];
              const dueDebts = debtByDate[iso] || [];
              const intensity = maxSpend > 0 ? Math.min(1, (data?.expense || 0) / maxSpend) : 0;
              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    "relative flex aspect-square flex-col items-start justify-between rounded-lg border p-1.5 text-[10px] transition",
                    "hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-900/20",
                    otherMonth ? "border-transparent text-ink-400" : "border-ink-100 dark:border-ink-800",
                    selectedDate === iso && "ring-2 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-ink-900",
                    isToday && "border-brand-500"
                  )}
                  style={{
                    background:
                      intensity > 0 && !otherMonth
                        ? `linear-gradient(180deg, rgba(239,68,68,${intensity * 0.18}) 0%, transparent 60%)`
                        : undefined,
                  }}
                >
                  <span className={cn("font-semibold", isToday && "text-brand-700 dark:text-brand-300")}>
                    {d.getDate()}
                  </span>
                  <div className="flex w-full flex-col gap-0.5">
                    {data?.income ? (
                      <span className="truncate text-success-dark dark:text-success">+{formatCurrency(data.income, settings.currency, settings.locale, { maximumFractionDigits: 0 })}</span>
                    ) : null}
                    {data?.expense ? (
                      <span className="truncate text-danger-dark dark:text-danger">-{formatCurrency(data.expense, settings.currency, settings.locale, { maximumFractionDigits: 0 })}</span>
                    ) : null}
                    {dueDebts.length > 0 && (
                      <span className="inline-flex items-center gap-1 truncate text-warn-dark dark:text-warn">
                        <span className="h-1 w-1 rounded-full bg-warn" />
                        {dueDebts.length} deuda
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-ink-500 dark:text-ink-400">
            <div className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Ingresos
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Gastos (intensidad)
            </div>
            <div className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warn" /> Pagos de deuda
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{selectedDate ? formatDateLong(selectedDate) : "Selecciona un día"}</CardTitle>
              <CardSubtitle>
                {selectedDate
                  ? `${selectedTx.length} movimientos • ${selectedDebts.length} deudas con vencimiento`
                  : "Haz clic en cualquier día del calendario"}
              </CardSubtitle>
            </div>
          </CardHeader>

          {!selectedDate ? (
            <Empty title="Sin día seleccionado" description="Haz clic en un día para ver el detalle." />
          ) : selectedTx.length === 0 && selectedDebts.length === 0 ? (
            <Empty title="Sin movimientos" description="Este día no tiene movimientos ni pagos programados." />
          ) : (
            <div className="flex flex-col gap-3">
              {selectedTx.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {selectedTx.map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-xl border border-ink-100 p-3 dark:border-ink-800">
                      <div>
                        <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{t.name}</div>
                        <div className="text-[11px] text-ink-500 dark:text-ink-400">
                          {t.category}{t.subcategory ? ` • ${t.subcategory}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={"text-sm font-semibold " + (t.type === "income" ? "text-success-dark dark:text-success" : "text-ink-900 dark:text-ink-50")}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {selectedDebts.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-medium text-warn-dark dark:text-warn">Deudas con vencimiento</div>
                  <ul className="flex flex-col gap-1.5">
                    {selectedDebts.map((d) => (
                      <li key={d.id} className="flex items-center justify-between rounded-xl border border-warn/30 bg-warn/5 p-3 dark:bg-warn/10">
                        <div>
                          <div className="text-sm font-medium text-ink-800 dark:text-ink-100">{d.name}</div>
                          <div className="text-[11px] text-ink-500 dark:text-ink-400">{d.institution}</div>
                        </div>
                        <Badge variant="warning">Pago mínimo {fmt(d.minimumPayment)}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
