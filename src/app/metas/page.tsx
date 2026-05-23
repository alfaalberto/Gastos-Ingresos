"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { KpiCard, Progress, Badge, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { computeGoalSummaries, simulateSavings } from "@/lib/calculations";
import { hasErrors, validateGoal } from "@/lib/validators";
import { formatCurrency, formatDate, maskAmount } from "@/lib/formatters";
import { todayISODate } from "@/lib/utils";
import type { Goal, GoalPriority } from "@/types/finance";

export default function MetasPage() {
  const state = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simMonths, setSimMonths] = useState("12");
  const [simAmount, setSimAmount] = useState("2000");
  const [simRate, setSimRate] = useState("10");

  const goalSummaries = computeGoalSummaries(state.goals);
  const onTrack = goalSummaries.filter((g) => g.onTrack).length;
  const totalTarget = state.goals.reduce((a, b) => a + b.targetAmount, 0);
  const totalCurrent = state.goals.reduce((a, b) => a + b.currentAmount, 0);

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, state.settings.currency, state.settings.locale, { maximumFractionDigits: 0 }), state.settings.privacyMode);

  const projected = simulateSavings(Number(simAmount || 0), Number(simMonths || 0), Number(simRate || 0));

  return (
    <AppShell title="Metas de ahorro" subtitle="Visualiza, simula y acelera tus objetivos">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total metas" value={state.goals.length.toString()} icon={<Target className="h-4 w-4" />} accent="brand" />
          <KpiCard label="En buen camino" value={`${onTrack}/${state.goals.length}`} accent="success" />
          <KpiCard label="Objetivo total" value={fmt(totalTarget)} accent="gold" />
          <KpiCard label="Avance acumulado" value={fmt(totalCurrent)} hint={`${totalTarget ? ((totalCurrent / totalTarget) * 100).toFixed(0) : 0}% del total`} accent="success" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setSimulationOpen(true)} leftIcon={<TrendingUp className="h-4 w-4" />}>
            Simulador de ahorro
          </Button>
          <Button onClick={() => { setEditing(null); setOpen(true); }} leftIcon={<Plus className="h-4 w-4" />}>
            Nueva meta
          </Button>
        </div>

        {goalSummaries.length === 0 ? (
          <Empty title="Sin metas creadas" description="Crea una meta para empezar a ahorrar con dirección." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {goalSummaries.map((g) => (
              <Card key={g.goal.id}>
                <CardHeader>
                  <div>
                    <CardTitle>{g.goal.name}</CardTitle>
                    <CardSubtitle>
                      {fmt(g.goal.currentAmount)} de {fmt(g.goal.targetAmount)} • Fecha objetivo {formatDate(g.goal.targetDate)}
                    </CardSubtitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                      onClick={() => { setEditing(g.goal); setOpen(true); }}
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger"
                      onClick={() => setDeletingId(g.goal.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardHeader>
                <Progress value={g.progressPct} color={g.onTrack ? "success" : "warning"} size="md" />
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-500">{g.progressPct.toFixed(0)}% alcanzado</span>
                  <Badge variant={g.onTrack ? "success" : "warning"}>
                    {g.onTrack ? "En buen camino" : "En riesgo"}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-ink-50 px-2 py-2 dark:bg-ink-800/50">
                    <div className="text-[10px] uppercase text-ink-500">Restante</div>
                    <div className="text-xs font-semibold text-ink-900 dark:text-ink-50">
                      {fmt(Math.max(0, g.goal.targetAmount - g.goal.currentAmount))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-ink-50 px-2 py-2 dark:bg-ink-800/50">
                    <div className="text-[10px] uppercase text-ink-500">Meses</div>
                    <div className="text-xs font-semibold text-ink-900 dark:text-ink-50">{g.monthsRemaining}</div>
                  </div>
                  <div className="rounded-lg bg-ink-50 px-2 py-2 dark:bg-ink-800/50">
                    <div className="text-[10px] uppercase text-ink-500">Aport. mensual</div>
                    <div className="text-xs font-semibold text-ink-900 dark:text-ink-50">{fmt(g.suggestedMonthly)}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={g.goal.priority === "high" ? "danger" : g.goal.priority === "medium" ? "warning" : "info"}>
                    Prioridad {g.goal.priority === "high" ? "alta" : g.goal.priority === "medium" ? "media" : "baja"}
                  </Badge>
                  <Button size="sm" onClick={() => setContributing(g.goal)}>Aportar</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? "Editar meta" : "Nueva meta"} size="md">
          <GoalForm initial={editing || undefined} onClose={() => { setOpen(false); setEditing(null); }} />
        </Modal>

        <ConfirmDialog
          open={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={() => deletingId && state.deleteGoal(deletingId)}
          title="¿Eliminar meta?"
          description="Esta acción no se puede deshacer."
          confirmText="Eliminar"
        />

        <ContributeDialog goal={contributing} onClose={() => setContributing(null)} />

        <Modal
          open={simulationOpen}
          onClose={() => setSimulationOpen(false)}
          title="Simulador de ahorro"
          description="Estima cuánto puedes acumular aportando mensualmente."
          size="md"
          footer={<Button onClick={() => setSimulationOpen(false)}>Cerrar</Button>}
        >
          <div className="grid grid-cols-3 gap-3">
            <Input label="Aportación mensual" type="number" min="0" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} leftIcon={<span className="text-ink-500">$</span>} />
            <Input label="Meses" type="number" min="1" value={simMonths} onChange={(e) => setSimMonths(e.target.value)} />
            <Input label="Tasa anual (%)" type="number" min="0" step="0.1" value={simRate} onChange={(e) => setSimRate(e.target.value)} />
          </div>
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-900/50 dark:bg-brand-900/20">
            <div className="text-xs text-ink-600 dark:text-ink-300">Valor estimado al final del periodo</div>
            <div className="mt-1 text-2xl font-semibold text-brand-700 dark:text-brand-200">{fmt(projected)}</div>
            <div className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
              Aportado: {fmt(Number(simAmount || 0) * Number(simMonths || 0))} • Intereses: {fmt(Math.max(0, projected - Number(simAmount || 0) * Number(simMonths || 0)))}
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}

function GoalForm({ initial, onClose }: { initial?: Goal; onClose: () => void }) {
  const addGoal = useFinanceStore((s) => s.addGoal);
  const updateGoal = useFinanceStore((s) => s.updateGoal);
  const [form, setForm] = useState<Partial<Goal>>({
    name: initial?.name ?? "",
    targetAmount: initial?.targetAmount,
    currentAmount: initial?.currentAmount ?? 0,
    targetDate: initial?.targetDate ?? todayISODate(),
    priority: initial?.priority ?? "medium",
    category: initial?.category,
    notes: initial?.notes,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateGoal>>({});

  const set = (k: keyof Goal, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateGoal(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (initial?.id) updateGoal(initial.id, form);
    else addGoal(form as Required<Goal>);
    onClose();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input label="Nombre" value={form.name || ""} onChange={(e) => set("name", e.target.value)} required error={errors.name} />
      <Input label="Categoría" placeholder="Viaje, Auto, Ahorro…" value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
      <Input label="Monto objetivo" type="number" min="0" step="0.01" value={form.targetAmount ?? ""} onChange={(e) => set("targetAmount", Number(e.target.value))} error={errors.targetAmount} />
      <Input label="Monto actual" type="number" min="0" step="0.01" value={form.currentAmount ?? ""} onChange={(e) => set("currentAmount", Number(e.target.value))} error={errors.currentAmount} />
      <Input label="Fecha objetivo" type="date" value={form.targetDate || ""} onChange={(e) => set("targetDate", e.target.value)} error={errors.targetDate} />
      <Select label="Prioridad" value={form.priority} onChange={(e) => set("priority", e.target.value as GoalPriority)}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </Select>
      <div className="sm:col-span-2">
        <Textarea label="Notas" value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} />
      </div>
      <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function ContributeDialog({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const contributeToGoal = useFinanceStore((s) => s.contributeToGoal);
  const accounts = useFinanceStore((s) => s.accounts);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");

  if (!goal) return null;
  return (
    <Modal
      open={Boolean(goal)}
      onClose={onClose}
      title={`Aportar a ${goal.name}`}
      description="Suma al avance y crea un movimiento asociado."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!amount || Number(amount) <= 0}
            onClick={() => {
              contributeToGoal(goal.id, Number(amount), accountId);
              onClose();
            }}
          >
            Aportar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label="Monto"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          leftIcon={<span className="text-ink-500">$</span>}
        />
        <Select label="Cuenta origen" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
