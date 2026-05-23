"use client";

import { useFinanceStore } from "@/store/financeStore";
import { computeHealthScore } from "@/lib/financialAnalysis";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function HealthScore() {
  const state = useFinanceStore();
  const health = computeHealthScore(state);

  const ringColor =
    health.level === "excellent"
      ? "stroke-success"
      : health.level === "good"
      ? "stroke-brand-500"
      : health.level === "fair"
      ? "stroke-warn"
      : "stroke-danger";

  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (health.score / 100) * c;

  const breakdownItems = [
    { label: "Ahorro", value: health.breakdown.savingsScore, max: 25 },
    { label: "Deuda", value: health.breakdown.debtScore, max: 20 },
    { label: "Flujo", value: health.breakdown.cashflowScore, max: 20 },
    { label: "Presupuesto", value: health.breakdown.budgetScore, max: 15 },
    { label: "Emergencia", value: health.breakdown.emergencyFundScore, max: 10 },
    { label: "Variabilidad", value: health.breakdown.variabilityScore, max: 5 },
    { label: "Ingresos", value: health.breakdown.incomeStabilityScore, max: 5 },
  ];

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 to-transparent dark:from-brand-900/20" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center justify-center">
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                strokeWidth="10"
                className="stroke-ink-100 dark:stroke-ink-800"
              />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                className={cn("transition-all duration-700", ringColor)}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">{health.score}</span>
              <span className="text-xs text-ink-500 dark:text-ink-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Financial Health Score</h3>
            <Badge
              variant={
                health.level === "excellent"
                  ? "success"
                  : health.level === "good"
                  ? "info"
                  : health.level === "fair"
                  ? "warning"
                  : "danger"
              }
            >
              {health.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-snug text-ink-600 dark:text-ink-300">{health.message}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {breakdownItems.map((b) => (
              <div key={b.label} className="rounded-lg bg-white/70 px-2.5 py-2 backdrop-blur dark:bg-ink-900/50">
                <div className="text-[10px] uppercase tracking-wide text-ink-500 dark:text-ink-400">{b.label}</div>
                <div className="mt-0.5 text-sm font-semibold text-ink-900 dark:text-ink-50">
                  {b.value.toFixed(0)}
                  <span className="ml-1 text-[10px] font-normal text-ink-400">/ {b.max}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      b.value / b.max >= 0.75 ? "bg-success" : b.value / b.max >= 0.5 ? "bg-brand-500" : b.value / b.max >= 0.25 ? "bg-warn" : "bg-danger"
                    )}
                    style={{ width: `${(b.value / b.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
