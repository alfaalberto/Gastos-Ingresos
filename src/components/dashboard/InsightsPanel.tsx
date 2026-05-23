"use client";

import { useFinanceStore } from "@/store/financeStore";
import { buildInsights } from "@/lib/financialAnalysis";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Sparkles, AlertTriangle, CheckCircle2, Info, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function InsightsPanel() {
  const state = useFinanceStore();
  const insights = buildInsights(state).slice(0, 6);

  const iconFor = (lvl: string) => {
    if (lvl === "positive") return <CheckCircle2 className="h-4 w-4" />;
    if (lvl === "warning") return <AlertTriangle className="h-4 w-4" />;
    if (lvl === "danger") return <TrendingDown className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const styleFor = (lvl: string) => {
    if (lvl === "positive") return "bg-success/10 text-success-dark dark:text-success";
    if (lvl === "warning") return "bg-warn/10 text-warn-dark dark:text-warn";
    if (lvl === "danger") return "bg-danger/10 text-danger-dark dark:text-danger";
    return "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300";
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold" /> Resumen inteligente
            </span>
          </CardTitle>
          <CardSubtitle>Análisis automático de tus finanzas este mes</CardSubtitle>
        </div>
      </CardHeader>

      <ul className="flex flex-col gap-2">
        {insights.length === 0 ? (
          <li className="rounded-lg bg-ink-50 p-3 text-sm text-ink-500 dark:bg-ink-800/40">
            Aún no hay suficientes datos para generar insights.
          </li>
        ) : (
          insights.map((ins) => (
            <li key={ins.id} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3 dark:border-ink-800">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", styleFor(ins.level))}>
                {iconFor(ins.level)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-snug text-ink-800 dark:text-ink-100">{ins.title}</p>
                {ins.detail && <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{ins.detail}</p>}
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
