"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Printer } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { CashflowChart, NetTrendChart, CategoryDonut } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/Button";
import { useFinanceStore } from "@/store/financeStore";
import {
  compareMoM,
  expensesByCategory,
  expensesByPaymentMethod,
  monthlySeries,
  projectNextMonths,
  topCategories,
} from "@/lib/calculations";
import { formatCurrency, formatCompact, formatPercent, maskAmount, monthYearLabel } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";

const COLORS = ["#3258f5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#14b8a6", "#c9a24a"];

export default function ReportesPage() {
  const { transactions, settings } = useFinanceStore();
  const mKey = monthKey(todayISODate());
  const cmp = compareMoM(transactions, mKey);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, settings.currency, settings.locale, { maximumFractionDigits: 0 }), settings.privacyMode);

  const byMethod = useMemo(() => {
    const data = expensesByPaymentMethod(transactions, mKey);
    return Object.entries(data)
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, mKey]);

  const series12 = useMemo(() => monthlySeries(transactions, 12).map((m) => ({ ...m, name: m.label })), [transactions]);
  const projection = useMemo(() => projectNextMonths(transactions, 12, 3).map((m) => ({ ...m, name: m.label })), [transactions]);
  const top = useMemo(() => topCategories(transactions, mKey, 8), [transactions, mKey]);

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    window.print();
  };

  return (
    <AppShell title="Reportes" subtitle="Gráficas, proyecciones e indicadores avanzados">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-ink-600 dark:text-ink-300">
            Período: <span className="font-semibold">{monthYearLabel(mKey)}</span>
          </div>
          <Button variant="outline" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>
            Imprimir reporte
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Comparativa MoM</CardTitle>
                <CardSubtitle>Mes actual vs mes anterior</CardSubtitle>
              </div>
            </CardHeader>
            <ul className="flex flex-col gap-2.5">
              <ComparisonRow label="Ingresos" current={cmp.current.income} previous={cmp.previous.income} delta={cmp.incomeDeltaPct} positiveHigher fmt={fmt} />
              <ComparisonRow label="Gastos" current={cmp.current.expenses} previous={cmp.previous.expenses} delta={cmp.expensesDeltaPct} fmt={fmt} />
              <ComparisonRow label="Neto" current={cmp.current.net} previous={cmp.previous.net} delta={cmp.netDeltaPct} positiveHigher fmt={fmt} />
              <li className="flex items-center justify-between border-t border-ink-100 pt-2 text-sm dark:border-ink-800">
                <span className="text-ink-500 dark:text-ink-400">Tasa de ahorro</span>
                <span className="font-semibold text-ink-900 dark:text-ink-50">{formatPercent(cmp.current.savingsRate)}</span>
              </li>
            </ul>
          </Card>

          <div className="lg:col-span-2">
            <CashflowChart />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CategoryDonut />
          <NetTrendChart />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Por método de pago</CardTitle>
                <CardSubtitle>Distribución del mes</CardSubtitle>
              </div>
            </CardHeader>
            <div className="h-56 w-full">
              {byMethod.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-ink-400">Sin datos</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byMethod} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                      {byMethod.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v), settings.currency, settings.locale)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Histórico 12 meses</CardTitle>
              <CardSubtitle>Ingresos vs gastos por mes</CardSubtitle>
            </div>
          </CardHeader>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series12} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, settings.locale)} width={60} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v), settings.currency, settings.locale)} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Proyección financiera</CardTitle>
                <CardSubtitle>Próximos 12 meses (basado en últimos 3)</CardSubtitle>
              </div>
            </CardHeader>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projection} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCompact(v, settings.locale)} width={60} />
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v), settings.currency, settings.locale)} />
                  <Bar dataKey="net" name="Neto proyectado" fill="#3258f5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Top categorías del mes</CardTitle>
                <CardSubtitle>Ordenadas por monto</CardSubtitle>
              </div>
            </CardHeader>
            <ul className="flex flex-col gap-2">
              {top.map((c, i) => {
                const totalAll = Object.values(expensesByCategory(transactions, mKey)).reduce((a, b) => a + b, 0);
                const pct = totalAll ? (c.total / totalAll) * 100 : 0;
                return (
                  <li key={c.category} className="">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-800 dark:text-ink-100">
                        <span className="mr-2 text-ink-400">{i + 1}.</span>{c.category}
                      </span>
                      <span className="text-ink-500">{fmt(c.total)} • {pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function ComparisonRow({
  label,
  current,
  previous,
  delta,
  positiveHigher,
  fmt,
}: {
  label: string;
  current: number;
  previous: number;
  delta: number;
  positiveHigher?: boolean;
  fmt: (n: number) => string;
}) {
  const isUp = delta >= 0;
  const isGood = positiveHigher ? isUp : !isUp;
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="text-ink-600 dark:text-ink-300">{label}</span>
      <div className="text-right">
        <div className="font-semibold text-ink-900 dark:text-ink-50">{fmt(current)}</div>
        <div className={"text-[11px] " + (isGood ? "text-success-dark dark:text-success" : "text-danger-dark dark:text-danger")}>
          {isUp ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs {fmt(previous)}
        </div>
      </div>
    </li>
  );
}
