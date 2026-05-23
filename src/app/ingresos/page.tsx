"use client";

import { useMemo, useState } from "react";
import { Plus, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";
import { KpiCard } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { useFinanceStore } from "@/store/financeStore";
import { incomeBySource, monthlySeries, sumByType, getMonthTransactions } from "@/lib/calculations";
import { formatCurrency, maskAmount } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";

export default function IngresosPage() {
  const { transactions, settings } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const mKey = monthKey(todayISODate());

  const stats = useMemo(() => {
    const monthTx = getMonthTransactions(transactions, mKey);
    const monthIncome = sumByType(monthTx, "income");
    const series = monthlySeries(transactions, 6);
    const avg = series.reduce((a, b) => a + b.income, 0) / Math.max(1, series.length);
    const sources = incomeBySource(transactions, mKey);
    const topSource = Object.entries(sources).sort((a, b) => b[1] - a[1])[0];
    return { monthIncome, avg, topSource };
  }, [transactions, mKey]);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, settings.currency, settings.locale, { maximumFractionDigits: 0 }), settings.privacyMode);

  return (
    <AppShell title="Ingresos" subtitle="Registra y analiza todas tus fuentes de ingreso">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard
            label="Ingresos del mes"
            value={fmt(stats.monthIncome)}
            icon={<TrendingUp className="h-4 w-4" />}
            accent="success"
          />
          <KpiCard
            label="Promedio mensual"
            value={fmt(stats.avg)}
            hint="Últimos 6 meses"
            icon={<TrendingUp className="h-4 w-4" />}
            accent="brand"
          />
          <KpiCard
            label="Fuente principal"
            value={stats.topSource ? stats.topSource[0] : "—"}
            hint={stats.topSource ? fmt(stats.topSource[1]) : "Aún sin ingresos"}
            accent="gold"
          />
        </div>

        <div className="flex justify-end">
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
            Registrar ingreso
          </Button>
        </div>

        <TransactionsTable
          defaultType="income"
          hideTypeFilter
          title="Tus ingresos"
          subtitle="Sueldo, freelance, inversiones y más"
        />

        <Modal open={open} onClose={() => setOpen(false)} title="Registrar ingreso" size="lg">
          <TransactionForm defaultType="income" onClose={() => setOpen(false)} />
        </Modal>
      </div>
    </AppShell>
  );
}
