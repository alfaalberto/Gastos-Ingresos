"use client";

import { useState } from "react";
import { Bell, Eye, EyeOff, Moon, Plus, Sparkles, Sun } from "lucide-react";
import { useFinanceStore } from "@/store/financeStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { buildAlerts } from "@/lib/financialAnalysis";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export function Topbar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const settings = useFinanceStore((s) => s.settings);
  const setTheme = useFinanceStore((s) => s.setTheme);
  const togglePrivacy = useFinanceStore((s) => s.togglePrivacy);
  const alerts = useFinanceStore((s) => buildAlerts(s));

  const [openTx, setOpenTx] = useState(false);
  const [openAlerts, setOpenAlerts] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">FinanzaPro</span>
          </div>
          <div className="hidden lg:block">
            {title && <h1 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-ink-50">{title}</h1>}
            {subtitle && <p className="text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={togglePrivacy}
            className="rounded-xl p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Modo privacidad"
            title="Modo privacidad"
          >
            {settings.privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setTheme(settings.theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Tema"
            title="Modo claro / oscuro"
          >
            {settings.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpenAlerts(true)}
            className="relative rounded-xl p-2 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Alertas"
            title="Alertas"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className={cn(
                "absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white",
                alerts.some((a) => a.level === "danger") ? "bg-danger" : "bg-warn"
              )}>
                {alerts.length}
              </span>
            )}
          </button>
          <Button
            size="sm"
            onClick={() => setOpenTx(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="hidden sm:inline-flex"
          >
            Movimiento
          </Button>
          <Button
            size="icon"
            onClick={() => setOpenTx(true)}
            aria-label="Nuevo movimiento"
            className="sm:hidden"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title mobile */}
      <div className="px-4 pb-3 lg:hidden sm:px-6">
        {title && <h1 className="text-xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">{title}</h1>}
        {subtitle && <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>}
      </div>

      <Modal open={openTx} onClose={() => setOpenTx(false)} title="Registrar movimiento" description="Captura rápida — ingreso, gasto o transferencia." size="lg">
        <TransactionForm onClose={() => setOpenTx(false)} />
      </Modal>

      <Modal open={openAlerts} onClose={() => setOpenAlerts(false)} title="Alertas" description={`${alerts.length} alertas activas`} size="md">
        {alerts.length === 0 ? (
          <p className="text-sm text-ink-500">No hay alertas. Todo en orden.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "rounded-xl border p-3 text-sm",
                  a.level === "danger" && "border-danger/30 bg-danger/5 dark:bg-danger/10",
                  a.level === "warning" && "border-warn/30 bg-warn/5 dark:bg-warn/10",
                  a.level === "info" && "border-ink-200 bg-ink-50 dark:border-ink-700 dark:bg-ink-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900 dark:text-ink-50">{a.title}</span>
                  <Badge variant={a.level === "danger" ? "danger" : a.level === "warning" ? "warning" : "info"} size="sm">
                    {a.level === "danger" ? "Crítica" : a.level === "warning" ? "Advertencia" : "Info"}
                  </Badge>
                </div>
                {a.detail && <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">{a.detail}</p>}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </header>
  );
}
