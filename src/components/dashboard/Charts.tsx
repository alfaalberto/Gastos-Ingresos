"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { expensesByCategory, monthlySeries } from "@/lib/calculations";
import { formatCurrency, formatCompact, monthYearLabel } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";

const CATEGORY_COLORS = [
  "#3258f5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#14b8a6", "#c9a24a",
  "#7c3aed", "#0ea5e9", "#f43f5e", "#eab308", "#64748b",
];

function TooltipBox({ active, payload, label, currency, locale }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-ink-700 dark:bg-ink-900">
      {label && <div className="mb-1 font-medium text-ink-800 dark:text-ink-100">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-ink-500 dark:text-ink-400">{p.name}:</span>
          <span className="font-medium text-ink-800 dark:text-ink-100">
            {formatCurrency(Number(p.value || 0), currency, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function CashflowChart() {
  const { transactions, settings } = useFinanceStore();
  const data = monthlySeries(transactions, 6).map((m) => ({
    name: m.label,
    Ingresos: m.income,
    Gastos: m.expenses,
    Neto: m.net,
  }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Ingresos vs Gastos</CardTitle>
          <CardSubtitle>Últimos 6 meses</CardSubtitle>
        </div>
      </CardHeader>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="rgba(100,116,139,0.7)"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCompact(v, settings.locale)}
              width={60}
            />
            <Tooltip content={<TooltipBox currency={settings.currency} locale={settings.locale} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
            <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2.4} fill="url(#gradIncome)" />
            <Area type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2.4} fill="url(#gradExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CategoryDonut() {
  const { transactions, settings } = useFinanceStore();
  const mKey = monthKey(todayISODate());
  const byCat = expensesByCategory(transactions, mKey);
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const data = entries.map(([category, value], i) => ({
    name: category,
    value,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Gastos por categoría</CardTitle>
          <CardSubtitle>{monthYearLabel(mKey)}</CardSubtitle>
        </div>
      </CardHeader>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative h-56">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-400">Sin datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={56} outerRadius={86} paddingAngle={2} stroke="none">
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipBox currency={settings.currency} locale={settings.locale} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wide text-ink-500">Total</span>
            <span className="text-base font-semibold text-ink-900 dark:text-ink-50">
              {formatCurrency(total, settings.currency, settings.locale, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5 self-center">
          {data.slice(0, 6).map((d) => (
            <li key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-ink-700 dark:text-ink-200">{d.name}</span>
              </div>
              <span className="font-medium text-ink-800 dark:text-ink-100">
                {formatCurrency(d.value, settings.currency, settings.locale, { maximumFractionDigits: 0 })}
              </span>
            </li>
          ))}
          {data.length > 6 && <li className="text-xs text-ink-500">+ {data.length - 6} categorías</li>}
        </ul>
      </div>
    </Card>
  );
}

export function NetTrendChart() {
  const { transactions, settings } = useFinanceStore();
  const data = monthlySeries(transactions, 6).map((m) => ({
    name: m.label,
    Neto: m.net,
  }));
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tendencia de ahorro neto</CardTitle>
          <CardSubtitle>Diferencia entre ingresos y gastos por mes</CardSubtitle>
        </div>
      </CardHeader>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="rgba(100,116,139,0.7)" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="rgba(100,116,139,0.7)"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => formatCompact(v, settings.locale)}
              width={60}
            />
            <Tooltip content={<TooltipBox currency={settings.currency} locale={settings.locale} />} />
            <Line type="monotone" dataKey="Neto" stroke="#3258f5" strokeWidth={2.4} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
