// Smart financial analysis: insights, alerts, and Financial Health Score.

import type { Debt, FinanceState, Goal, Transaction } from "@/types/finance";
import {
  compareMoM,
  computeAccountBalance,
  computeBudgetStatus,
  computeDebtSummary,
  computeGoalSummaries,
  computeMonthlySummary,
  detectAntExpenses,
  monthlySeries,
  recurringSubscriptions,
  topCategories,
} from "./calculations";
import { clamp, monthKey, parseLocalDate, pct, safeDiv, todayISODate } from "./utils";
import { formatCurrency, formatPercent } from "./formatters";

export interface Insight {
  id: string;
  level: "info" | "positive" | "warning" | "danger";
  title: string;
  detail?: string;
  icon?: string;
}

export interface Alert {
  id: string;
  level: "info" | "warning" | "danger";
  title: string;
  detail?: string;
  date?: string;
  ref?: { kind: "budget" | "debt" | "goal" | "transaction"; id: string };
}

export interface HealthBreakdown {
  savingsScore: number;
  debtScore: number;
  cashflowScore: number;
  budgetScore: number;
  emergencyFundScore: number;
  variabilityScore: number;
  incomeStabilityScore: number;
}

export interface HealthResult {
  score: number; // 0..100
  level: "critical" | "fair" | "good" | "excellent";
  label: string;
  message: string;
  breakdown: HealthBreakdown;
}

export function computeHealthScore(state: FinanceState, mKey = monthKey(todayISODate())): HealthResult {
  const summary = computeMonthlySummary(state.transactions, mKey);
  const debtSummary = computeDebtSummary(state.debts);
  const budgetStatus = computeBudgetStatus(state.budgets, state.transactions, mKey);
  const series = monthlySeries(state.transactions, 6);

  // 1) Savings rate (target = settings.savingsTargetPct, weight 25)
  const targetSavings = state.settings.savingsTargetPct || 20;
  const actualSavings = summary.savingsRate;
  const savingsScore = clamp((actualSavings / targetSavings) * 25, 0, 25);

  // 2) Debt level: debt-to-income ratio (lower is better, weight 20)
  const monthlyIncome = summary.income || series[series.length - 2]?.income || 1;
  const dti = safeDiv(debtSummary.totalCurrent, monthlyIncome * 12); // 0..1+
  const debtScore = clamp(20 - dti * 20, 0, 20);

  // 3) Cash flow positive (weight 20)
  const cashflowScore = summary.net >= 0 ? 20 : clamp(20 + (summary.net / Math.max(1, summary.income)) * 20, 0, 20);

  // 4) Budget compliance (weight 15)
  let budgetScore = 15;
  if (budgetStatus.length > 0) {
    const overshoots = budgetStatus.filter((b) => b.status === "exceeded").length;
    const warns = budgetStatus.filter((b) => b.status === "danger").length;
    const penalty = overshoots * 5 + warns * 2;
    budgetScore = clamp(15 - penalty, 0, 15);
  }

  // 5) Emergency fund: liquid balance >= N months expenses (weight 10)
  const liquid = state.accounts
    .filter((a) => a.isActive && ["cash", "bank", "debit", "wallet"].includes(a.type))
    .reduce((acc, a) => acc + computeAccountBalance(a.id, state.transactions, state.accounts), 0);
  const monthsCovered = safeDiv(liquid, Math.max(1, summary.expenses));
  const targetMonths = state.settings.emergencyFundMonths || 3;
  const emergencyFundScore = clamp((monthsCovered / targetMonths) * 10, 0, 10);

  // 6) Variable vs fixed expenses balance (weight 5)
  const varRatio = safeDiv(summary.variableExpenses, summary.expenses);
  const variabilityScore = clamp(5 - Math.max(0, varRatio - 0.4) * 10, 0, 5);

  // 7) Income stability — std dev of last 6 months income (weight 5)
  const incomes = series.map((s) => s.income).filter((v) => v > 0);
  const mean = incomes.reduce((a, b) => a + b, 0) / Math.max(1, incomes.length);
  const variance = incomes.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, incomes.length);
  const cv = mean ? Math.sqrt(variance) / mean : 1;
  const incomeStabilityScore = clamp(5 - cv * 5, 0, 5);

  const breakdown: HealthBreakdown = {
    savingsScore,
    debtScore,
    cashflowScore,
    budgetScore,
    emergencyFundScore,
    variabilityScore,
    incomeStabilityScore,
  };

  const score = Math.round(
    savingsScore + debtScore + cashflowScore + budgetScore + emergencyFundScore + variabilityScore + incomeStabilityScore
  );

  let level: HealthResult["level"];
  let label: string;
  let message: string;
  if (score >= 80) {
    level = "excellent";
    label = "Excelente";
    message = "Tu salud financiera es sólida. Mantén el ritmo y refuerza tu fondo de emergencia e inversiones.";
  } else if (score >= 60) {
    level = "good";
    label = "Bueno";
    message = "Vas bien. Reduce gastos variables y aumenta tu ahorro mensual para subir tu score.";
  } else if (score >= 40) {
    level = "fair";
    label = "Regular";
    message = "Tienes áreas claras de mejora. Revisa tus presupuestos y plan de deuda.";
  } else {
    level = "critical";
    label = "Crítico";
    message = "Tu situación requiere acción inmediata: prioriza pagar deuda, reducir gastos y estabilizar tu flujo.";
  }

  return { score, level, label, message, breakdown };
}

export function buildInsights(state: FinanceState, mKey = monthKey(todayISODate())): Insight[] {
  const out: Insight[] = [];
  const summary = computeMonthlySummary(state.transactions, mKey);
  const cmp = compareMoM(state.transactions, mKey);
  const topCats = topCategories(state.transactions, mKey, 3);
  const ants = detectAntExpenses(state.transactions, mKey);
  const subs = recurringSubscriptions(state.transactions);
  const debtSummary = computeDebtSummary(state.debts);
  const goals = computeGoalSummaries(state.goals);

  // MoM expenses
  if (isFinite(cmp.expensesDeltaPct) && Math.abs(cmp.expensesDeltaPct) > 1) {
    const positive = cmp.expensesDeltaPct < 0;
    out.push({
      id: "mom-exp",
      level: positive ? "positive" : "warning",
      title: positive
        ? `Tus gastos bajaron ${formatPercent(Math.abs(cmp.expensesDeltaPct))} vs el mes pasado.`
        : `Este mes estás gastando ${formatPercent(Math.abs(cmp.expensesDeltaPct))} más que el mes pasado.`,
    });
  }

  // Top category
  if (topCats[0]) {
    out.push({
      id: "top-cat",
      level: "info",
      title: `Tu mayor categoría de gasto es ${topCats[0].category}.`,
      detail: `Total: ${formatCurrency(topCats[0].total, state.settings.currency, state.settings.locale)}`,
    });
  }

  // Savings rate
  if (summary.income > 0) {
    if (summary.savingsRate < 10) {
      out.push({
        id: "savings-low",
        level: "warning",
        title: `Tu ahorro mensual es de ${formatPercent(summary.savingsRate)}, por debajo del 10% recomendado.`,
        detail: "Considera reducir gastos opcionales para acercarte a la meta.",
      });
    } else if (summary.savingsRate >= state.settings.savingsTargetPct) {
      out.push({
        id: "savings-good",
        level: "positive",
        title: `¡Excelente! Estás ahorrando ${formatPercent(summary.savingsRate)} este mes.`,
      });
    }
  }

  // Cash flow
  if (summary.net < 0) {
    out.push({
      id: "cashflow-neg",
      level: "danger",
      title: `Tu flujo de efectivo es negativo (${formatCurrency(summary.net, state.settings.currency, state.settings.locale)}).`,
      detail: "Tus gastos superan tus ingresos este mes.",
    });
  } else {
    out.push({
      id: "cashflow-pos",
      level: "positive",
      title: "Tu flujo de efectivo del mes es positivo.",
    });
  }

  // Hormiga
  if (ants.count >= 8) {
    out.push({
      id: "ant",
      level: "warning",
      title: `Detectamos ${ants.count} gastos hormiga este mes (${formatCurrency(ants.total, state.settings.currency, state.settings.locale)}).`,
      detail: "Pequeños gastos frecuentes que se acumulan rápido.",
    });
  }

  // Subscriptions
  if (subs.length > 0) {
    const subsMonth = subs.filter((s) => monthKey(s.date) === mKey);
    const total = subsMonth.reduce((a, b) => a + b.amount, 0);
    if (total > 0) {
      out.push({
        id: "subs",
        level: "info",
        title: `Tus suscripciones representan ${formatPercent(pct(total, summary.expenses))} de tus gastos mensuales.`,
        detail: `Pagas ${formatCurrency(total, state.settings.currency, state.settings.locale)} en suscripciones recurrentes.`,
      });
    }
  }

  // Potential savings
  const variable = summary.variableExpenses;
  if (variable > 0) {
    const potential = variable * 0.15;
    out.push({
      id: "save-potential",
      level: "info",
      title: `Si reduces 15% tus gastos variables, podrías ahorrar ${formatCurrency(potential, state.settings.currency, state.settings.locale)} adicionales.`,
    });
  }

  // Debt
  if (debtSummary.totalCurrent > 0) {
    const ratio = pct(debtSummary.totalCurrent, summary.income * 12 || 1);
    if (ratio > 40) {
      out.push({
        id: "debt-high",
        level: "danger",
        title: "Tu nivel de deuda es alto respecto a tus ingresos anuales.",
        detail: "Considera la estrategia avalancha para pagar primero las deudas con mayor tasa.",
      });
    } else {
      out.push({
        id: "debt-ok",
        level: "positive",
        title: "Tu nivel de deuda está dentro de un rango moderado.",
      });
    }
  }

  // Goals at risk
  const atRisk = goals.filter((g) => !g.onTrack);
  if (atRisk.length > 0) {
    out.push({
      id: "goals-risk",
      level: "warning",
      title: `${atRisk.length} ${atRisk.length === 1 ? "meta está" : "metas están"} en riesgo de no cumplirse a tiempo.`,
      detail: atRisk.map((g) => g.goal.name).join(", "),
    });
  }

  // Avg daily spend
  if (summary.avgDailySpend > 0) {
    out.push({
      id: "daily-avg",
      level: "info",
      title: `Tu gasto promedio diario es de ${formatCurrency(summary.avgDailySpend, state.settings.currency, state.settings.locale)}.`,
    });
  }

  return out;
}

export function buildAlerts(state: FinanceState, mKey = monthKey(todayISODate())): Alert[] {
  const alerts: Alert[] = [];
  const today = new Date();
  // Budget alerts
  const budgetStatus = computeBudgetStatus(state.budgets, state.transactions, mKey);
  for (const b of budgetStatus) {
    if (b.status === "exceeded") {
      alerts.push({
        id: `budget-${b.budget.id}`,
        level: "danger",
        title: `Presupuesto excedido: ${b.budget.category}`,
        detail: `Has usado ${formatPercent(b.usagePct)} de tu presupuesto.`,
        ref: { kind: "budget", id: b.budget.id },
      });
    } else if (b.status === "danger") {
      const dim = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const daysLeft = Math.max(0, dim - today.getDate());
      alerts.push({
        id: `budget-${b.budget.id}`,
        level: "warning",
        title: `${b.budget.category} casi agotado`,
        detail: `${formatPercent(b.usagePct)} usado y faltan ${daysLeft} días para terminar el mes.`,
        ref: { kind: "budget", id: b.budget.id },
      });
    }
  }
  // Debt due dates
  for (const d of state.debts) {
    if (d.status === "paid") continue;
    const due = parseLocalDate(d.dueDate);
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) {
      alerts.push({
        id: `debt-od-${d.id}`,
        level: "danger",
        title: `Pago de ${d.name} vencido`,
        detail: `Venció el ${d.dueDate}.`,
        date: d.dueDate,
        ref: { kind: "debt", id: d.id },
      });
    } else if (diff <= 7) {
      alerts.push({
        id: `debt-due-${d.id}`,
        level: "warning",
        title: `Pago próximo: ${d.name}`,
        detail: `Vence el ${d.dueDate} (${Math.ceil(diff)} días).`,
        date: d.dueDate,
        ref: { kind: "debt", id: d.id },
      });
    }
  }
  // Goals at risk
  for (const g of computeGoalSummaries(state.goals)) {
    if (!g.onTrack && g.monthsRemaining <= 3) {
      alerts.push({
        id: `goal-risk-${g.goal.id}`,
        level: "warning",
        title: `Meta en riesgo: ${g.goal.name}`,
        detail: `Faltan ${g.monthsRemaining} meses y vas en ${formatPercent(g.progressPct)}.`,
        ref: { kind: "goal", id: g.goal.id },
      });
    }
  }
  return alerts;
}

export function debtRecommendation(debts: Debt[]): string {
  if (debts.length === 0) return "Sin deudas registradas.";
  const sorted = [...debts]
    .filter((d) => d.status !== "paid" && d.currentBalance > 0)
    .sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
  if (sorted.length === 0) return "No tienes deudas activas. ¡Excelente!";
  const top = sorted[0];
  return `Te recomendamos priorizar pagar “${top.name}” (${formatPercent(top.interestRate || 0)} de tasa) con estrategia avalancha para minimizar intereses.`;
}

export function unusualSpendingForCategory(transactions: Transaction[], category: string): Insight | null {
  const months = monthlySeries(transactions, 4);
  if (months.length < 3) return null;
  // compute expenses for category per month
  const series = months.map((m) => {
    const cat = transactions
      .filter((t) => monthKey(t.date) === m.monthKey && t.type === "expense" && t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
    return cat;
  });
  const last = series[series.length - 1];
  const prevAvg = series.slice(0, -1).reduce((a, b) => a + b, 0) / Math.max(1, series.length - 1);
  if (prevAvg <= 0) return null;
  const delta = ((last - prevAvg) / prevAvg) * 100;
  if (delta > 30) {
    return {
      id: `unusual-${category}`,
      level: "warning",
      title: `Gasto inusual en ${category}: +${formatPercent(delta)} vs promedio.`,
    };
  }
  return null;
}
