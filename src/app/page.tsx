"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Info,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard, Progress, Badge } from "@/components/ui/primitives";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { CashflowChart, CategoryDonut } from "@/components/dashboard/Charts";
import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { useFinanceStore } from "@/store/financeStore";
import {
  compareMoM,
  computeBalance,
  computeBudgetStatus,
  computeMonthlySummary,
} from "@/lib/calculations";
import { formatCurrency, maskAmount } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";
import type { TransactionType } from "@/types/finance";
import Link from "next/link";

export default function DashboardPage() {
  const state = useFinanceStore();
  const dismissDemo = useFinanceStore((s) => s.dismissDemo);
  const clearAll = useFinanceStore((s) => s.clearAll);
  const [quickType, setQuickType] = useState<TransactionType | null>(null);
  const [confirmFresh, setConfirmFresh] = useState(false);
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
        {/* Demo data banner */}
        {state.isDemoData && (
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-brand-800 dark:bg-brand-900/20">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-300" />
              <div>
                <div className="text-sm font-semibold text-brand-800 dark:text-brand-200">Estás viendo datos de demostración</div>
                <div className="text-xs text-brand-700/80 dark:text-brand-300/80">
                  Explora la app con ejemplos realistas, o empieza de cero con tus propias finanzas.
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button size="sm" onClick={() => setConfirmFresh(true)}>Empezar de cero</Button>
              <button
                onClick={dismissDemo}
                className="rounded-xl p-2 text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-900/40"
                aria-label="Seguir explorando con datos demo"
                title="Seguir explorando"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

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

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="danger" leftIcon={<ArrowDownRight className="h-4 w-4" />} onClick={() => setQuickType("expense")}>
            Registrar gasto
          </Button>
          <Button size="sm" variant="success" leftIcon={<ArrowUpRight className="h-4 w-4" />} onClick={() => setQuickType("income")}>
            Registrar ingreso
          </Button>
          <Link href="/reportes">
            <Button size="sm" variant="outline" leftIcon={<BarChart3 className="h-4 w-4" />}>Reportes</Button>
          </Link>
          <Link href="/calendario">
            <Button size="sm" variant="outline" leftIcon={<CalendarDays className="h-4 w-4" />}>Calendario</Button>
          </Link>
        </div>

        {/* Financial Health Score */}
        <HealthScore />

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

      {/* Quick capture modal */}
      <Modal
        open={quickType !== null}
        onClose={() => setQuickType(null)}
        title={quickType === "income" ? "Registrar ingreso" : "Registrar gasto"}
        description="Captura rápida — hasta un chicle cuenta."
        size="lg"
      >
        {quickType && <TransactionForm defaultType={quickType} onClose={() => setQuickType(null)} />}
      </Modal>

      {/* Start fresh confirm */}
      <ConfirmDialog
        open={confirmFresh}
        onClose={() => setConfirmFresh(false)}
        onConfirm={clearAll}
        title="¿Empezar de cero?"
        description="Se eliminarán los datos de demostración (movimientos, cuentas, presupuestos, deudas y metas). Tus categorías y preferencias se conservan."
        confirmText="Sí, empezar de cero"
      />
    </AppShell>
  );
}

