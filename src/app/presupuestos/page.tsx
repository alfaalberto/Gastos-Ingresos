"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet, AlertTriangle, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore, selectExpenseCategories } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { KpiCard, Progress, Badge, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { validateBudget, hasErrors } from "@/lib/validators";
import { computeBudgetStatus } from "@/lib/calculations";
import { formatCurrency, maskAmount, monthYearLabel } from "@/lib/formatters";
import { monthKey, todayISODate } from "@/lib/utils";
import type { Budget } from "@/types/finance";

export default function PresupuestosPage() {
  const state = useFinanceStore();
  const [mKey, setMKey] = useState(monthKey(todayISODate()));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statuses = useMemo(
    () => computeBudgetStatus(state.budgets, state.transactions, mKey),
    [state.budgets, state.transactions, mKey]
  );

  const summary = useMemo(() => {
    const total = statuses.reduce((a, b) => a + b.budget.monthlyLimit, 0);
    const spent = statuses.reduce((a, b) => a + b.spent, 0);
    const exceeded = statuses.filter((b) => b.status === "exceeded").length;
    return { total, spent, exceeded, remaining: Math.max(0, total - spent) };
  }, [statuses]);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, state.settings.currency, state.settings.locale, { maximumFractionDigits: 0 }), state.settings.privacyMode);

  // Months for selector (current + last 5)
  const monthsAvailable = useMemo(() => {
    const out: string[] = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      out.push(monthKey(m));
    }
    return out;
  }, []);

  return (
    <AppShell title="Presupuestos" subtitle="Define límites mensuales y mantén el control">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Asignado" value={fmt(summary.total)} icon={<Wallet className="h-4 w-4" />} accent="brand" />
          <KpiCard label="Gastado" value={fmt(summary.spent)} accent="warning" />
          <KpiCard label="Disponible" value={fmt(summary.remaining)} accent="success" />
          <KpiCard
            label="Excedidos"
            value={summary.exceeded.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            accent={summary.exceeded > 0 ? "danger" : "neutral"}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select value={mKey} onChange={(e) => setMKey(e.target.value)} className="max-w-[220px]">
            {monthsAvailable.map((m) => (
              <option key={m} value={m}>
                {monthYearLabel(m)}
              </option>
            ))}
          </Select>
          <Button onClick={() => { setEditing(null); setOpen(true); }} leftIcon={<Plus className="h-4 w-4" />}>
            Nuevo presupuesto
          </Button>
        </div>

        {statuses.length === 0 ? (
          <Empty
            title="Sin presupuestos para este mes"
            description="Crea presupuestos por categoría para evitar sorpresas."
            action={
              <Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
                Crear presupuesto
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statuses.map((b) => (
              <Card key={b.budget.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{b.budget.category}</CardTitle>
                    <CardSubtitle>{fmt(b.spent)} de {fmt(b.budget.monthlyLimit)}</CardSubtitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                      onClick={() => { setEditing(b.budget); setOpen(true); }}
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger"
                      onClick={() => setDeletingId(b.budget.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardHeader>
                <Progress
                  value={b.usagePct}
                  color={
                    b.status === "exceeded" ? "danger" :
                    b.status === "danger" ? "warning" :
                    b.status === "warning" ? "gold" : "success"
                  }
                  size="md"
                />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-500 dark:text-ink-400">{b.usagePct.toFixed(0)}% usado</span>
                  <Badge variant={b.status === "exceeded" ? "danger" : b.status === "danger" ? "warning" : b.status === "warning" ? "gold" : "success"}>
                    {b.status === "exceeded" ? "Excedido" :
                     b.status === "danger" ? "Cerca del límite" :
                     b.status === "warning" ? "Atención" : "En rango"}
                  </Badge>
                </div>
                {b.status !== "ok" && (
                  <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600 dark:bg-ink-800/50 dark:text-ink-300">
                    {b.status === "exceeded"
                      ? `Te excediste por ${fmt(Math.max(0, -b.remaining))}. Considera ajustar el límite o reducir gastos.`
                      : `Quedan ${fmt(b.remaining)} disponibles este mes.`}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={open}
          onClose={() => { setOpen(false); setEditing(null); }}
          title={editing ? "Editar presupuesto" : "Nuevo presupuesto"}
          size="md"
        >
          <BudgetForm
            initial={editing || { month: mKey }}
            onClose={() => { setOpen(false); setEditing(null); }}
          />
        </Modal>

        <ConfirmDialog
          open={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={() => deletingId && state.deleteBudget(deletingId)}
          title="¿Eliminar presupuesto?"
          description="Esta acción no se puede deshacer."
          confirmText="Eliminar"
        />
      </div>
    </AppShell>
  );
}

function BudgetForm({ initial, onClose }: { initial: Partial<Budget>; onClose: () => void }) {
  const upsertBudget = useFinanceStore((s) => s.upsertBudget);
  const categories = useFinanceStore(selectExpenseCategories);

  const [category, setCategory] = useState(initial?.category ?? categories[0]?.name ?? "");
  const [monthlyLimit, setMonthlyLimit] = useState<string>(initial?.monthlyLimit?.toString() ?? "");
  const [month, setMonth] = useState(initial?.month ?? monthKey(todayISODate()));
  const [errors, setErrors] = useState<ReturnType<typeof validateBudget>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      category,
      monthlyLimit: Number(monthlyLimit),
      month,
    };
    const errs = validateBudget(payload);
    setErrors(errs);
    if (hasErrors(errs)) return;
    upsertBudget({ ...payload, id: initial?.id });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Select label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} error={errors.category}>
        {categories.map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </Select>
      <Input
        label="Límite mensual"
        type="number"
        step="0.01"
        min="0"
        value={monthlyLimit}
        onChange={(e) => setMonthlyLimit(e.target.value)}
        leftIcon={<span className="text-ink-500">$</span>}
        error={errors.monthlyLimit}
      />
      <Input
        label="Mes (YYYY-MM)"
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        error={errors.month}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
