"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard, Progress, Badge } from "@/components/ui/primitives";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { CashflowChart, CategoryDonut } from "@/components/dashboard/Charts";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { useFinanceStore } from "@/store/financeStore";
import {
  compareMoM,
  computeBalance,
  computeBudgetStatus,
  computeMonthlySummary,
} from "@/lib/calculations";
import { formatCurrency, maskAmount } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const state = useFinanceStore();
  const mKey = monthKey(todayISODate());
  const summary = computeMonthlySummary(state.transactions, mKey);
  const cmp = compareMoM(state.transactions, mKey);
  const balance = computeBalance(state.transactions, state.accounts);
  const budgets = computeBudgetStatus(state.budgets, state.transactions, mKey);
  const totalBudget = budgets.reduce((acc, b) => acc + b.budget.monthlyLimit, 0);
  const totalSpentBudget = budgets.reduce((acc, b) => acc + b.spent, 0);
  const availableBudget = Math.max(0, totalBudget - totalSpentBudget);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, state.settings.currency, state.settings.locale, { maximumFractionDigits: 0 }), state.settings.privacyMode);

  return (
    <AppShell title="Dashboard" subtitle="Vista general de tu salud financiera">
      <div className="flex flex-col gap-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <KpiCard
            label="Balance total"
            value={fmt(balance)}
            hint="Suma de todas tus cuentas"
            icon={<Wallet className="h-4 w-4" />}
            accent="brand"
          />
          <KpiCard
            label="Ingresos del mes"
            value={fmt(summary.income)}
            delta={{ value: cmp.incomeDeltaPct, positive: cmp.incomeDeltaPct >= 0 }}
            icon={<ArrowUpRight className="h-4 w-4" />}
            accent="success"
          />
          <KpiCard
            label="Gastos del mes"
            value={fmt(summary.expenses)}
            delta={{ value: -cmp.expensesDeltaPct, positive: cmp.expensesDeltaPct < 0 }}
            icon={<ArrowDownRight className="h-4 w-4" />}
            accent="danger"
          />
          <KpiCard
            label="Presupuesto disponible"
            value={fmt(availableBudget)}
            hint={`de ${fmt(totalBudget)} asignado`}
            icon={<ShieldCheck className="h-4 w-4" />}
            accent="gold"
          />
        </div>

        {/* Charts + insights */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CashflowChart />
          </div>
          <InsightsPanel />
        </div>

        {/* Bottom grid: Category Distribution, Budgets, and Recent Movements */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CategoryDonut />

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Presupuestos del mes</CardTitle>
                <CardSubtitle>Estado por categoría</CardSubtitle>
              </div>
              <Link href="/presupuestos" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                Ver todos
              </Link>
            </CardHeader>
            {budgets.length === 0 ? (
              <p className="text-sm text-ink-500">Aún no has creado presupuestos.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {budgets.slice(0, 4).map((b) => (
                  <li key={b.budget.id} className="">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-800 dark:text-ink-100">{b.budget.category}</span>
                      <span className="text-ink-500 dark:text-ink-400">
                        {fmt(b.spent)} / {fmt(b.budget.monthlyLimit)}
                      </span>
                    </div>
                    <Progress
                      value={b.usagePct}
                      color={
                        b.status === "exceeded"
                          ? "danger"
                          : b.status === "danger"
                          ? "warning"
                          : b.status === "warning"
                          ? "gold"
                          : "success"
                      }
                    />
                    <div className="mt-0.5 flex justify-end">
                      <Badge variant={b.status === "exceeded" ? "danger" : b.status === "danger" ? "warning" : b.status === "warning" ? "gold" : "success"}>
                        {b.status === "exceeded"
                          ? "Excedido"
                          : b.status === "danger"
                          ? ">90%"
                          : b.status === "warning"
                          ? ">70%"
                          : "En rango"}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <RecentMovements limit={6} />
        </div>
      </div>
    </AppShell>
  );
}

