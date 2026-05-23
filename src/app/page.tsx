"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Receipt,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard, Progress, Badge } from "@/components/ui/primitives";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { CashflowChart, CategoryDonut, NetTrendChart } from "@/components/dashboard/Charts";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { useFinanceStore } from "@/store/financeStore";
import {
  compareMoM,
  computeBalance,
  computeBudgetStatus,
  computeDebtSummary,
  computeGoalSummaries,
  computeMonthlySummary,
} from "@/lib/calculations";
import { formatCurrency, formatPercent, maskAmount } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const state = useFinanceStore();
  const mKey = monthKey(todayISODate());
  const summary = computeMonthlySummary(state.transactions, mKey);
  const cmp = compareMoM(state.transactions, mKey);
  const balance = computeBalance(state.transactions, state.accounts);
  const debtSummary = computeDebtSummary(state.debts);
  const goals = computeGoalSummaries(state.goals);
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
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
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
            label="Ahorro neto"
            value={fmt(summary.net)}
            hint={`${formatPercent(summary.savingsRate)} de tasa de ahorro`}
            icon={<PiggyBank className="h-4 w-4" />}
            accent={summary.net >= 0 ? "success" : "danger"}
          />
          <KpiCard
            label="Gastos fijos"
            value={fmt(summary.fixedExpenses)}
            hint="Renta, servicios, suscripciones"
            icon={<Receipt className="h-4 w-4" />}
            accent="neutral"
          />
          <KpiCard
            label="Gastos variables"
            value={fmt(summary.variableExpenses)}
            hint="Comida, ocio, impulsivos"
            icon={<Receipt className="h-4 w-4" />}
            accent="warning"
          />
          <KpiCard
            label="Deudas activas"
            value={fmt(debtSummary.totalCurrent)}
            hint={`${formatPercent(debtSummary.payoffPct)} liquidado`}
            icon={<CreditCard className="h-4 w-4" />}
            accent="warning"
          />
          <KpiCard
            label="Presupuesto disponible"
            value={fmt(availableBudget)}
            hint={`de ${fmt(totalBudget)} asignado`}
            icon={<ShieldCheck className="h-4 w-4" />}
            accent="gold"
          />
        </div>

        {/* Health score */}
        <HealthScore />

        {/* Charts + insights */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CashflowChart />
          </div>
          <InsightsPanel />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CategoryDonut />
          <NetTrendChart />
          <RecentMovements />
        </div>

        {/* Budgets / goals quick view */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                {budgets.slice(0, 5).map((b) => (
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

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Metas de ahorro</CardTitle>
                <CardSubtitle>Progreso actual</CardSubtitle>
              </div>
              <Link href="/metas" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                Ver todas
              </Link>
            </CardHeader>
            {goals.length === 0 ? (
              <p className="text-sm text-ink-500">Aún no has creado metas.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {goals.slice(0, 4).map((g) => (
                  <li key={g.goal.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-ink-800 dark:text-ink-100">{g.goal.name}</span>
                        <span className="text-ink-500 dark:text-ink-400">
                          {fmt(g.goal.currentAmount)} / {fmt(g.goal.targetAmount)}
                        </span>
                      </div>
                      <Progress value={g.progressPct} color={g.onTrack ? "success" : "warning"} className="mt-1" />
                      <div className="mt-0.5 flex justify-end">
                        <Badge variant={g.onTrack ? "success" : "warning"}>
                          {g.onTrack ? "En buen camino" : "En riesgo"}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
