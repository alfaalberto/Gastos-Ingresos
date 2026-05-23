"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { KpiCard, Badge, Empty } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { Input, Select, Switch, Textarea } from "@/components/ui/Input";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { computeAccountBalance } from "@/lib/calculations";
import { hasErrors, validateAccount } from "@/lib/validators";
import { formatCurrency, maskAmount } from "@/lib/formatters";
import type { Account, AccountType } from "@/types/finance";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "bank", label: "Cuenta bancaria" },
  { value: "debit", label: "Tarjeta de débito" },
  { value: "credit", label: "Tarjeta de crédito" },
  { value: "investment", label: "Inversión" },
  { value: "wallet", label: "Wallet digital" },
  { value: "trading", label: "Trading" },
  { value: "other", label: "Otra" },
];

const ACCOUNT_COLORS = ["#0F4C81", "#10b981", "#1f2937", "#FFE600", "#7c3aed", "#f59e0b", "#ef4444", "#06b6d4"];

export default function CuentasPage() {
  const state = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalBalance = state.accounts
    .filter((a) => a.isActive)
    .reduce((acc, a) => acc + computeAccountBalance(a.id, state.transactions, state.accounts), 0);
  const activeCount = state.accounts.filter((a) => a.isActive).length;

  const fmt = (n: number) =>
    maskAmount(formatCurrency(n, state.settings.currency, state.settings.locale, { maximumFractionDigits: 0 }), state.settings.privacyMode);

  return (
    <AppShell title="Cuentas" subtitle="Administra tus cuentas, tarjetas y wallets">
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <KpiCard label="Patrimonio líquido" value={fmt(totalBalance)} icon={<Wallet className="h-4 w-4" />} accent="brand" />
          <KpiCard label="Cuentas activas" value={activeCount.toString()} accent="success" />
          <KpiCard label="Total registradas" value={state.accounts.length.toString()} accent="neutral" />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => { setEditing(null); setOpen(true); }} leftIcon={<Plus className="h-4 w-4" />}>
            Nueva cuenta
          </Button>
        </div>

        {state.accounts.length === 0 ? (
          <Empty title="Sin cuentas" description="Agrega tu primera cuenta para empezar a registrar movimientos." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {state.accounts.map((a) => {
              const balance = computeAccountBalance(a.id, state.transactions, state.accounts);
              const typeLabel = ACCOUNT_TYPES.find((t) => t.value === a.type)?.label ?? a.type;
              return (
                <Card key={a.id} className={cn("relative overflow-hidden", !a.isActive && "opacity-60")}>
                  <div
                    className="absolute inset-x-0 top-0 h-1.5"
                    style={{ background: a.color || "#3258f5" }}
                  />
                  <CardHeader>
                    <div>
                      <CardTitle>{a.name}</CardTitle>
                      <CardSubtitle>{typeLabel} {a.institution ? `• ${a.institution}` : ""}</CardSubtitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                        onClick={() => { setEditing(a); setOpen(true); }}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded-lg p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger"
                        onClick={() => setDeletingId(a.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardHeader>

                  <div className="mt-1">
                    <div className="text-[10px] uppercase tracking-wide text-ink-500 dark:text-ink-400">Saldo actual</div>
                    <div className="mt-0.5 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                      {fmt(balance)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-500 dark:text-ink-400">
                      Inicial: {fmt(a.initialBalance)} • {a.currency}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant={a.isActive ? "success" : "default"}>{a.isActive ? "Activa" : "Inactiva"}</Badge>
                    {a.type === "credit" && (
                      <Badge variant="warning" size="sm">Tarjeta de crédito</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          open={open}
          onClose={() => { setOpen(false); setEditing(null); }}
          title={editing ? "Editar cuenta" : "Nueva cuenta"}
          size="md"
        >
          <AccountForm initial={editing || undefined} onClose={() => { setOpen(false); setEditing(null); }} />
        </Modal>

        <ConfirmDialog
          open={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          onConfirm={() => deletingId && state.deleteAccount(deletingId)}
          title="¿Eliminar cuenta?"
          description="Los movimientos asociados quedarán sin cuenta vinculada."
          confirmText="Eliminar"
        />
      </div>
    </AppShell>
  );
}

function AccountForm({ initial, onClose }: { initial?: Account; onClose: () => void }) {
  const addAccount = useFinanceStore((s) => s.addAccount);
  const updateAccount = useFinanceStore((s) => s.updateAccount);

  const [form, setForm] = useState<Partial<Account>>({
    name: initial?.name ?? "",
    type: initial?.type ?? "bank",
    initialBalance: initial?.initialBalance ?? 0,
    currency: initial?.currency ?? "MXN",
    institution: initial?.institution ?? "",
    color: initial?.color ?? ACCOUNT_COLORS[0],
    isActive: initial?.isActive ?? true,
    notes: initial?.notes,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateAccount>>({});

  const set = (k: keyof Account, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateAccount(form);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (initial?.id) updateAccount(initial.id, form);
    else addAccount(form as Required<Account>);
    onClose();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input label="Nombre" value={form.name || ""} onChange={(e) => set("name", e.target.value)} required error={errors.name} />
      <Select label="Tipo" value={form.type} onChange={(e) => set("type", e.target.value as AccountType)} error={errors.type}>
        {ACCOUNT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </Select>
      <Input label="Saldo inicial" type="number" step="0.01" value={form.initialBalance ?? 0} onChange={(e) => set("initialBalance", Number(e.target.value))} error={errors.initialBalance} leftIcon={<span className="text-ink-500">$</span>} />
      <Input label="Moneda" value={form.currency || ""} onChange={(e) => set("currency", e.target.value.toUpperCase())} required error={errors.currency} />
      <Input label="Institución" value={form.institution || ""} onChange={(e) => set("institution", e.target.value)} />
      <div>
        <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-ink-200">Color</label>
        <div className="flex flex-wrap items-center gap-2">
          {ACCOUNT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition",
                form.color === c ? "border-ink-900 dark:border-white" : "border-transparent"
              )}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="sm:col-span-2 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
        <Switch checked={Boolean(form.isActive)} onChange={(v) => set("isActive", v)} label="Cuenta activa" hint="Se incluye en cálculos y reportes" size="sm" />
      </div>
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
