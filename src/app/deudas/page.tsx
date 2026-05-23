"use client";

import { useMemo, useState } from "react";
import { CreditCard, Plus, Trash2, Pencil, CalendarClock, TrendingUp, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { KpiCard, Progress, Badge, Empty, Segmented } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { computeDebtSummary, simulateDebtPayoff } from "@/lib/calculations";
import { debtRecommendation } from "@/lib/financialAnalysis";
import { hasErrors, validateDebt } from "@/lib/validators";
import { formatCurrency, formatDate, formatPercent, maskAmount } from "@/lib/formatters";
import { todayISODate } from "@/lib/utils";
import type { Debt, DebtStatus, DebtStrategy } from "@/types/finance";

export default function DeudasPage() {
  const state = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Debt | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");
  const [extraBudget, setExtraBudget] = useState("4000");

  const summary = computeDebtSummary(state.debts);
  const plan = useMemo(
    () => simulateDebtPayoff(state.debts, summary.monthlyPaymentTotal + Number(extraBudget || 0), strategy),
    [state.debts, summary.monthlyPaymentTotal, strategy, extraBudget]
  );

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, state.settings.currency, state.settings.locale, { maximumFractionDigits: 0 }), state.settings.privacyMode);

  return (
    <AppShell title="Deudas" subtitle="Plan, estrategia y seguimiento de tus pasivos">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Deuda total" value={fmt(summary.totalCurrent)} icon={<CreditCard className="h-4 w-4" />} accent="danger" />
          <KpiCard label="Liquidado" value={formatPercent(summary.payoffPct)} hint={`${fmt(summary.totalPaid)} pagado`} accent="success" />
          <KpiCard label="Pago mensual" value={fmt(summary.monthlyPaymentTotal)} accent="warning" />
          <KpiCard label="Interés mensual estimado" value={fmt(summary.estimatedInterestPerMonth)} accent="gold" />
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-gold" /> Simulador de pago</span>
              </CardTitle>
              <CardSubtitle>{debtRecommendation(state.debts)}</CardSubtitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-ink-200">Estrategia</label>
              <Segmented
                value={strategy}
                onChange={setStrategy}
                options={[
                  { value: "avalanche", label: "Avalancha" },
                  { value: "snowball", label: "Bola de nieve" },
                ]}
              />
              <p className="mt-1.5 text-[11px] text-ink-500 dark:text-ink-400">
                {strategy === "avalanche"
                  ? "Prioriza pagar primero la deuda con MAYOR tasa de interés."
                  : "Prioriza pagar primero la deuda con MENOR saldo (motivacional)."}
              </p>
            </div>
            <Input
              label="Pago extra mensual"
              type="number"
              min="0"
              step="100"
              value={extraBudget}
              onChange={(e) => setExtraBudget(e.target.value)}
              leftIcon={<span className="text-ink-500">$</span>}
              hint={`Presupuesto total simulado: ${fmt(summary.monthlyPaymentTotal + Number(extraBudget || 0))}`}
            />
            <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <div className="text-xs text-ink-500 dark:text-ink-400">Tiempo a libertad financiera</div>
              <div className="mt-1 text-2xl font-semibold text-ink-900 dark:text-ink-50">
                {plan.monthsToFreedom > 0 ? `${plan.monthsToFreedom} meses` : "—"}
              </div>
              <div className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">
                Intereses estimados: <span className="font-medium">{fmt(plan.totalInterestEstimated)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={() => { setEditing(null); setOpen(true); }} leftIcon={<Plus className="h-4 w-4" />}>
            Nueva deuda
          </Button>
        </div>

        {state.debts.length === 0 ? (
          <Empty title="Sin deudas registradas" description="¡Excelente!  Si tienes alguna, regístrala para llevar control." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {state.debts.map((d) => {
              const payoffPct = d.originalAmount > 0 ? ((d.originalAmount - d.currentBalance) / d.originalAmount) * 100 : 0;
              const dueDays = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <Card key={d.id}>
                  <CardHeader>
                    <div>
                      <CardTitle>{d.name}</CardTitle>
                      <CardSubtitle>{d.institution}</CardSubtitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                        onClick={() => { setEditing(d); setOpen(true); }}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger"
                        onClick={() => setDeletingId(d.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-800/50">
                      <div className="text-[10px] uppercase text-ink-500">Saldo actual</div>
                      <div className="text-base font-semibold text-ink-900 dark:text-ink-50">{fmt(d.currentBalance)}</div>
                    </div>
                    <div className="rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-800/50">
                      <div className="text-[10px] uppercase text-ink-500">Original</div>
                      <div className="text-base font-semibold text-ink-700 dark:text-ink-200">{fmt(d.originalAmount)}</div>
                    </div>
                    <div className="rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-800/50">
                      <div className="text-[10px] uppercase text-ink-500">Tasa anual</div>
                      <div className="text-base font-semibold text-ink-900 dark:text-ink-50">{formatPercent(d.interestRate || 0)}</div>
                    </div>
                    <div className="rounded-lg bg-ink-50 px-3 py-2 dark:bg-ink-800/50">
                      <div className="text-[10px] uppercase text-ink-500">Pago mínimo</div>
                      <div className="text-base font-semibold text-ink-900 dark:text-ink-50">{fmt(d.minimumPayment)}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-ink-500">Avance de liquidación</span>
                      <span className="font-medium text-ink-700 dark:text-ink-200">{payoffPct.toFixed(0)}%</span>
                    </div>
                    <Progress value={payoffPct} color="success" size="md" />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-300">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Próximo pago: {formatDate(d.dueDate)}
                      <Badge variant={dueDays < 0 ? "danger" : dueDays <= 7 ? "warning" : "info"} size="sm">
                        {dueDays < 0 ? "Vencido" : dueDays === 0 ? "Hoy" : `en ${dueDays}d`}
                      </Badge>
                    </div>
                    <Button size="sm" onClick={() => setPayingDebt(d)} leftIcon={<TrendingUp className="h-3.5 w-3.5" />}>
                      Registrar pago
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          open={open}
          onClose={() => { setOpen(false); setEditing(null); }}
          title={editing ? "Editar deuda" : "Nueva deuda"}
          size="md"
        >
          <DebtForm initial={editing || undefined} onClose={() => { setOpen(false); setEditing(null); }} />
        </Modal>

        <PaymentDialog debt={payingDebt} onClose={() => setPayingDebt(null)} />

        <ConfirmDialog
          open={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={() => deletingId && state.deleteDebt(deletingId)}
          title="¿Eliminar deuda?"
          description="Esta acción no se puede deshacer."
          confirmText="Eliminar"
        />
      </div>
    </AppShell>
  );
}

function DebtForm({ initial, onClose }: { initial?: Debt; onClose: () => void }) {
  const addDebt = useFinanceStore((s) => s.addDebt);
  const updateDebt = useFinanceStore((s) => s.updateDebt);

  const [form, setForm] = useState<Partial<Debt>>({
    name: initial?.name ?? "",
    institution: initial?.institution ?? "",
    originalAmount: initial?.originalAmount,
    currentBalance: initial?.currentBalance,
    interestRate: initial?.interestRate,
    minimumPayment: initial?.minimumPayment,
    plannedPayment: initial?.plannedPayment,
    dueDate: initial?.dueDate ?? todayISODate(),
    strategy: initial?.strategy ?? "fixed",
    status: initial?.status ?? "active",
    notes: initial?.notes,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateDebt>>({});

  const set = (k: keyof Debt, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateDebt(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (initial?.id) updateDebt(initial.id, form);
    else addDebt(form as Required<Debt>);
    onClose();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input label="Nombre" value={form.name || ""} onChange={(e) => set("name", e.target.value)} required error={errors.name} />
      <Input label="Institución" value={form.institution || ""} onChange={(e) => set("institution", e.target.value)} required error={errors.institution} />
      <Input label="Monto original" type="number" min="0" step="0.01" value={form.originalAmount ?? ""} onChange={(e) => set("originalAmount", Number(e.target.value))} error={errors.originalAmount} />
      <Input label="Saldo actual" type="number" min="0" step="0.01" value={form.currentBalance ?? ""} onChange={(e) => set("currentBalance", Number(e.target.value))} error={errors.currentBalance} />
      <Input label="Tasa anual (%)" type="number" min="0" step="0.01" value={form.interestRate ?? ""} onChange={(e) => set("interestRate", Number(e.target.value))} />
      <Input label="Pago mínimo" type="number" min="0" step="0.01" value={form.minimumPayment ?? ""} onChange={(e) => set("minimumPayment", Number(e.target.value))} error={errors.minimumPayment} />
      <Input label="Pago planeado" type="number" min="0" step="0.01" value={form.plannedPayment ?? ""} onChange={(e) => set("plannedPayment", Number(e.target.value))} />
      <Input label="Fecha límite" type="date" value={form.dueDate || ""} onChange={(e) => set("dueDate", e.target.value)} required error={errors.dueDate} />
      <Select label="Estrategia" value={form.strategy} onChange={(e) => set("strategy", e.target.value as DebtStrategy)}>
        <option value="fixed">Pago fijo</option>
        <option value="avalanche">Avalancha</option>
        <option value="snowball">Bola de nieve</option>
        <option value="custom">Personalizado</option>
      </Select>
      <Select label="Estado" value={form.status} onChange={(e) => set("status", e.target.value as DebtStatus)}>
        <option value="active">Activa</option>
        <option value="paid">Liquidada</option>
        <option value="overdue">Vencida</option>
        <option value="paused">Pausada</option>
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

function PaymentDialog({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const applyDebtPayment = useFinanceStore((s) => s.applyDebtPayment);
  const accounts = useFinanceStore((s) => s.accounts);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");

  if (!debt) return null;

  return (
    <Modal
      open={Boolean(debt)}
      onClose={onClose}
      title={`Pago a ${debt.name}`}
      description="Registra un pago. Esto actualiza el saldo y crea un movimiento."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!amount || Number(amount) <= 0}
            onClick={() => {
              applyDebtPayment(debt.id, Number(amount), accountId);
              onClose();
            }}
          >
            Registrar pago
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
