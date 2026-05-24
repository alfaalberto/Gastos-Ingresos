"use client";

import { useState } from "react";
import { Download, RefreshCcw, Trash2, Upload, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Input, Select, Switch } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { downloadFile, transactionsToCSV } from "@/lib/csv";
import type { CategoryDef, ThemeMode } from "@/types/finance";
import { uid } from "@/lib/utils";
import Link from "next/link";

const CURRENCIES = [
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "USD", label: "USD — Dólar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "COP", label: "COP — Peso colombiano" },
  { value: "CLP", label: "CLP — Peso chileno" },
  { value: "PEN", label: "PEN — Sol peruano" },
];

const LOCALES = [
  { value: "es-MX", label: "Español (México)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "es-AR", label: "Español (Argentina)" },
  { value: "en-US", label: "English (US)" },
];

const DATE_FORMATS = [
  { value: "dd/MM/yyyy", label: "DD/MM/AAAA" },
  { value: "MM/dd/yyyy", label: "MM/DD/AAAA" },
  { value: "yyyy-MM-dd", label: "AAAA-MM-DD" },
];

export default function ConfiguracionPage() {
  const state = useFinanceStore();
  const updateSettings = useFinanceStore((s) => s.updateSettings);
  const resetToMock = useFinanceStore((s) => s.resetToMock);
  const clearAll = useFinanceStore((s) => s.clearAll);
  const importState = useFinanceStore((s) => s.importState);
  const [resetOpen, setResetOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  const handleBackup = () => {
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(`finanzapro-backup-${today}.json`, JSON.stringify({
      transactions: state.transactions,
      accounts: state.accounts,
      budgets: state.budgets,
      debts: state.debts,
      goals: state.goals,
      categories: state.categories,
      settings: state.settings,
    }, null, 2), "application/json");
  };

  const handleRestore = () => {
    try {
      const data = JSON.parse(restoreText);
      importState(data);
      setRestoreOpen(false);
      setRestoreText("");
    } catch {
      alert("JSON inválido.");
    }
  };

  const handleExportCSV = () => {
    const csv = transactionsToCSV(state.transactions);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(`finanzapro-movimientos-${today}.csv`, csv);
  };

  return (
    <AppShell title="Configuración" subtitle="Personaliza FinanzaPro a tu manera">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Preferencias generales</CardTitle>
              <CardSubtitle>Moneda, idioma y formato de fecha</CardSubtitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select label="Moneda principal" value={state.settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
            <Select label="Idioma / Región" value={state.settings.locale} onChange={(e) => updateSettings({ locale: e.target.value })}>
              {LOCALES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
            <Select label="Formato de fecha" value={state.settings.dateFormat} onChange={(e) => updateSettings({ dateFormat: e.target.value })}>
              {DATE_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Select>
            <Select label="Tema" value={state.settings.theme} onChange={(e) => updateSettings({ theme: e.target.value as ThemeMode })}>
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </Select>
            <div className="sm:col-span-2">
              <Input
                label="Presupuesto mensual total (opcional)"
                type="number"
                min="0"
                value={state.settings.monthlyBudgetTotal ?? ""}
                onChange={(e) => updateSettings({ monthlyBudgetTotal: e.target.value ? Number(e.target.value) : undefined })}
                leftIcon={<span className="text-ink-500">$</span>}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notificaciones y privacidad</CardTitle>
              <CardSubtitle>Alertas inteligentes y modo discreto</CardSubtitle>
            </div>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <Switch
                checked={state.settings.privacyMode}
                onChange={(v) => updateSettings({ privacyMode: v })}
                label="Modo privacidad"
                hint="Oculta montos en pantalla"
                size="sm"
              />
            </div>
            <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <Switch
                checked={state.settings.notifications.budgetAlerts}
                onChange={(v) => updateSettings({ notifications: { ...state.settings.notifications, budgetAlerts: v } })}
                label="Alertas de presupuesto"
                hint="Avisos al 70%, 90% y 100%"
                size="sm"
              />
            </div>
            <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <Switch
                checked={state.settings.notifications.unusualSpending}
                onChange={(v) => updateSettings({ notifications: { ...state.settings.notifications, unusualSpending: v } })}
                label="Gastos inusuales"
                hint="Detección automática de anomalías"
                size="sm"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Categorías personalizadas</CardTitle>
              <CardSubtitle>{state.categories.length} en total ({state.categories.filter(c=>c.kind==="expense").length} gastos / {state.categories.filter(c=>c.kind==="income").length} ingresos)</CardSubtitle>
            </div>
            <Button size="sm" onClick={() => setCatOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>Nueva</Button>
          </CardHeader>
          <div className="max-h-72 overflow-y-auto">
            <ul className="flex flex-col gap-1">
              {state.categories.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-ink-50 dark:hover:bg-ink-800/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-sm text-ink-700 dark:text-ink-200">{c.name}</span>
                    <Badge variant={c.kind === "income" ? "success" : "info"} size="sm">
                      {c.kind === "income" ? "Ingreso" : "Gasto"}
                    </Badge>
                  </div>
                  {!c.isDefault && (
                    <button
                      onClick={() => state.deleteCategory(c.id)}
                      className="rounded-lg p-1 text-ink-500 hover:bg-danger/10 hover:text-danger"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Datos y respaldo</CardTitle>
              <CardSubtitle>Exporta, importa o reinicia tu información</CardSubtitle>
            </div>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleBackup}>
              Descargar respaldo (JSON)
            </Button>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportCSV}>
              Exportar movimientos (CSV)
            </Button>
            <Button variant="outline" leftIcon={<Upload className="h-4 w-4" />} onClick={() => setRestoreOpen(true)}>
              Restaurar respaldo
            </Button>
            <Button variant="outline" leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => setResetOpen(true)}>
              Restablecer datos de ejemplo
            </Button>
            <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setClearOpen(true)}>
              Borrar todos mis datos
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Acerca de FinanzaPro</CardTitle>
              <CardSubtitle>App fintech personal premium</CardSubtitle>
            </div>
          </CardHeader>
          <p className="text-sm text-ink-600 dark:text-ink-300">
            FinanzaPro es una aplicación de finanzas personales diseñada para ayudarte a entender, registrar y mejorar tus hábitos financieros. Hasta el gasto más pequeño (sí, un chicle) cuenta.
          </p>
          <ul className="mt-3 flex flex-col gap-1 text-xs text-ink-500 dark:text-ink-400">
            <li>• Versión MVP 1.0</li>
            <li>• Datos almacenados localmente en tu navegador (LocalStorage)</li>
            <li>• Arquitectura lista para migrar a backend real</li>
          </ul>
          <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-800">
            <Link href="/ayuda">
              <Button variant="outline" className="w-full justify-center">
                Ver Manual de Usuario y Ayuda
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetToMock}
        title="¿Restablecer datos de ejemplo?"
        description="Se reemplazarán todos tus datos actuales por los datos de demostración."
        confirmText="Restablecer"
      />

      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={clearAll}
        title="¿Borrar todos los datos?"
        description="Esta acción es irreversible. Recomendado descargar respaldo antes."
        confirmText="Borrar todo"
      />

      <Modal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        title="Restaurar respaldo"
        description="Pega el contenido JSON del archivo de respaldo."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRestoreOpen(false)}>Cancelar</Button>
            <Button onClick={handleRestore} disabled={!restoreText.trim()}>Restaurar</Button>
          </>
        }
      >
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => setRestoreText(String(reader.result || ""));
            reader.readAsText(f, "utf-8");
          }}
          className="mb-3 block w-full text-sm"
        />
        <textarea
          value={restoreText}
          onChange={(e) => setRestoreText(e.target.value)}
          rows={10}
          placeholder="Pega aquí el contenido JSON…"
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-mono dark:border-ink-700 dark:bg-ink-900"
        />
      </Modal>

      <CategoryModal open={catOpen} onClose={() => setCatOpen(false)} />
    </AppShell>
  );
}

function CategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addCategory = useFinanceStore((s) => s.addCategory);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState("#3258f5");

  const submit = () => {
    if (!name.trim()) return;
    addCategory({ id: uid("cat"), name: name.trim(), kind, color } as CategoryDef);
    setName("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva categoría"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={!name.trim()}>Crear</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="Café diario, propina, etc." />
        <Select label="Tipo" value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </Select>
        <Input label="Color (hex)" value={color} onChange={(e) => setColor(e.target.value)} placeholder="#3258f5" />
      </div>
    </Modal>
  );
}
