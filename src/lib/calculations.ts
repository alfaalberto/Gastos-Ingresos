// Core financial calculations. Pure functions over transactions and entities.

import type {
  Account,
  Budget,
  Debt,
  Goal,
  Transaction,
} from "@/types/finance";
import { monthKey, pct, safeDiv } from "./utils";

export interface MonthlySummary {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number; // %
  fixedExpenses: number;
  variableExpenses: number;
  avgDailySpend: number;
  txCount: number;
}

export function getMonthTransactions(transactions: Transaction[], mKey: string): Transaction[] {
  return transactions.filter((t) => monthKey(t.date) === mKey);
}

export function sumByType(transactions: Transaction[], type: Transaction["type"]): number {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);
}

export function computeMonthlySummary(transactions: Transaction[], mKey: string): MonthlySummary {
  const monthTx = getMonthTransactions(transactions, mKey);
  const income = sumByType(monthTx, "income");
  const expenses = sumByType(monthTx, "expense");
  const net = income - expenses;
  const fixedExpenses = monthTx
    .filter((t) => t.type === "expense" && t.isFixed)
    .reduce((acc, t) => acc + t.amount, 0);
  const variableExpenses = expenses - fixedExpenses;
  const daysInMonth = (() => {
    const [y, m] = mKey.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  })();
  const today = new Date();
  const now = monthKey(today);
  const days = now === mKey ? today.getDate() : daysInMonth;
  return {
    income,
    expenses,
    net,
    savingsRate: pct(net, income),
    fixedExpenses,
    variableExpenses,
    avgDailySpend: safeDiv(expenses, days || 1),
    txCount: monthTx.length,
  };
}

export function computeBalance(transactions: Transaction[], accounts: Account[]): number {
  const initial = accounts.reduce((acc, a) => acc + (a.isActive !== false ? a.initialBalance : 0), 0);
  const tx = transactions.reduce((acc, t) => {
    if (t.type === "income") return acc + t.amount;
    if (t.type === "expense") return acc - t.amount;
    return acc;
  }, 0);
  return initial + tx;
}

export function computeAccountBalance(accountId: string, transactions: Transaction[], accounts: Account[]): number {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return 0;
  let bal = account.initialBalance;
  for (const t of transactions) {
    if (t.type === "income" && t.accountId === accountId) bal += t.amount;
    else if (t.type === "expense" && t.accountId === accountId) bal -= t.amount;
    else if (t.type === "transfer") {
      if (t.accountId === accountId) bal -= t.amount;
      if (t.toAccountId === accountId) bal += t.amount;
    }
  }
  return bal;
}

export function expensesByCategory(transactions: Transaction[], mKey?: string): Record<string, number> {
  const source = mKey ? getMonthTransactions(transactions, mKey) : transactions;
  const result: Record<string, number> = {};
  for (const t of source) {
    if (t.type !== "expense") continue;
    result[t.category] = (result[t.category] || 0) + t.amount;
  }
  return result;
}

export function incomeBySource(transactions: Transaction[], mKey?: string): Record<string, number> {
  const source = mKey ? getMonthTransactions(transactions, mKey) : transactions;
  const result: Record<string, number> = {};
  for (const t of source) {
    if (t.type !== "income") continue;
    const key = t.source || t.category || "Otros";
    result[key] = (result[key] || 0) + t.amount;
  }
  return result;
}

export function expensesByPaymentMethod(transactions: Transaction[], mKey?: string): Record<string, number> {
  const source = mKey ? getMonthTransactions(transactions, mKey) : transactions;
  const result: Record<string, number> = {};
  for (const t of source) {
    if (t.type !== "expense") continue;
    const key = t.paymentMethod || "Sin método";
    result[key] = (result[key] || 0) + t.amount;
  }
  return result;
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  usagePct: number; // 0..100
  status: "ok" | "warning" | "danger" | "exceeded";
}

export function computeBudgetStatus(budgets: Budget[], transactions: Transaction[], mKey: string): BudgetStatus[] {
  const monthBudgets = budgets.filter((b) => b.month === mKey);
  const monthTx = getMonthTransactions(transactions, mKey);
  return monthBudgets.map((b) => {
    const spent = monthTx
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((acc, t) => acc + t.amount, 0);
    const remaining = b.monthlyLimit - spent;
    const usagePct = pct(spent, b.monthlyLimit);
    let status: BudgetStatus["status"] = "ok";
    if (usagePct >= 100) status = "exceeded";
    else if (usagePct >= 90) status = "danger";
    else if (usagePct >= 70) status = "warning";
    return { budget: b, spent, remaining, usagePct, status };
  });
}

export interface DebtSummary {
  totalOriginal: number;
  totalCurrent: number;
  totalPaid: number;
  payoffPct: number;
  monthlyPaymentTotal: number;
  upcoming: Debt[];
  estimatedInterestPerMonth: number;
}

export function computeDebtSummary(debts: Debt[]): DebtSummary {
  const totalOriginal = debts.reduce((acc, d) => acc + d.originalAmount, 0);
  const totalCurrent = debts.reduce((acc, d) => acc + d.currentBalance, 0);
  const totalPaid = Math.max(0, totalOriginal - totalCurrent);
  const monthlyPaymentTotal = debts.reduce((acc, d) => acc + (d.plannedPayment || d.minimumPayment || 0), 0);
  const estimatedInterestPerMonth = debts.reduce(
    (acc, d) => acc + (d.currentBalance * ((d.interestRate || 0) / 100)) / 12,
    0
  );
  const sortedByDue = [...debts]
    .filter((d) => d.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return {
    totalOriginal,
    totalCurrent,
    totalPaid,
    payoffPct: pct(totalPaid, totalOriginal),
    monthlyPaymentTotal,
    upcoming: sortedByDue.slice(0, 5),
    estimatedInterestPerMonth,
  };
}

export interface GoalSummary {
  goal: Goal;
  progressPct: number;
  monthsRemaining: number;
  suggestedMonthly: number;
  onTrack: boolean;
}

export function computeGoalSummaries(goals: Goal[]): GoalSummary[] {
  return goals.map((g) => {
    const remaining = Math.max(0, g.targetAmount - g.currentAmount);
    const targetDate = new Date(g.targetDate);
    const now = new Date();
    const monthsRemaining = Math.max(
      0,
      (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth())
    );
    const suggestedMonthly = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
    const expectedProgress = monthsRemaining === 0 ? 1 : 1 - monthsRemaining / Math.max(1, monthsRemaining + 1);
    const progressPct = pct(g.currentAmount, g.targetAmount);
    return {
      goal: g,
      progressPct,
      monthsRemaining,
      suggestedMonthly,
      onTrack: progressPct / 100 >= expectedProgress * 0.85,
    };
  });
}

// Series of last N months. Returns array of {monthKey, label, income, expenses, net}.
export interface MonthlySeriesPoint {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
}

export function monthlySeries(transactions: Transaction[], months = 6): MonthlySeriesPoint[] {
  const points: MonthlySeriesPoint[] = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mk = monthKey(d);
    const summary = computeMonthlySummary(transactions, mk);
    const label = d.toLocaleDateString("es-MX", { month: "short" });
    points.push({
      monthKey: mk,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      income: summary.income,
      expenses: summary.expenses,
      net: summary.net,
    });
  }
  return points;
}

// Project savings/expenses for N future months based on trailing average.
export function projectNextMonths(transactions: Transaction[], months: number, trailing = 3): MonthlySeriesPoint[] {
  const history = monthlySeries(transactions, trailing);
  const avgInc = history.reduce((a, b) => a + b.income, 0) / Math.max(1, history.length);
  const avgExp = history.reduce((a, b) => a + b.expenses, 0) / Math.max(1, history.length);
  const today = new Date();
  const out: MonthlySeriesPoint[] = [];
  for (let i = 1; i <= months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const mk = monthKey(d);
    const label = d.toLocaleDateString("es-MX", { month: "short" });
    out.push({
      monthKey: mk,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      income: avgInc,
      expenses: avgExp,
      net: avgInc - avgExp,
    });
  }
  return out;
}

// Daily spending heatmap data for a given month.
export function dailySpendForMonth(transactions: Transaction[], mKey: string): Record<string, number> {
  const monthTx = getMonthTransactions(transactions, mKey);
  const map: Record<string, number> = {};
  for (const t of monthTx) {
    if (t.type !== "expense") continue;
    map[t.date] = (map[t.date] || 0) + t.amount;
  }
  return map;
}

// Comparative month-over-month deltas
export interface MoMComparison {
  current: MonthlySummary;
  previous: MonthlySummary;
  incomeDeltaPct: number;
  expensesDeltaPct: number;
  netDeltaPct: number;
}

export function compareMoM(transactions: Transaction[], mKey: string): MoMComparison {
  const [y, m] = mKey.split("-").map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevKey = monthKey(prevDate);
  const current = computeMonthlySummary(transactions, mKey);
  const previous = computeMonthlySummary(transactions, prevKey);
  const delta = (a: number, b: number) => (b === 0 ? (a === 0 ? 0 : 100) : ((a - b) / Math.abs(b)) * 100);
  return {
    current,
    previous,
    incomeDeltaPct: delta(current.income, previous.income),
    expensesDeltaPct: delta(current.expenses, previous.expenses),
    netDeltaPct: delta(current.net, previous.net),
  };
}

// Snowball: pay minimums on all debts, focus extra on smallest current balance.
// Avalanche: focus extra on highest interest rate.
// Returns ordered debt IDs and a payoff plan in months (approximate).
export interface DebtPayoffPlan {
  order: string[]; // debt ids in payoff order
  monthsToFreedom: number; // total months
  totalInterestEstimated: number;
}

export function simulateDebtPayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: "snowball" | "avalanche"
): DebtPayoffPlan {
  const list = debts
    .filter((d) => d.status !== "paid" && d.currentBalance > 0)
    .map((d) => ({
      id: d.id,
      balance: d.currentBalance,
      rate: (d.interestRate || 0) / 100 / 12,
      min: d.minimumPayment || 0,
    }));
  if (list.length === 0) return { order: [], monthsToFreedom: 0, totalInterestEstimated: 0 };

  const totalMin = list.reduce((acc, d) => acc + d.min, 0);
  const budget = Math.max(monthlyBudget, totalMin);
  const order: string[] = [];
  let months = 0;
  let interest = 0;

  while (list.some((d) => d.balance > 0) && months < 600) {
    // pick focus debt
    const candidates = list.filter((d) => d.balance > 0);
    const focus =
      strategy === "snowball"
        ? candidates.slice().sort((a, b) => a.balance - b.balance)[0]
        : candidates.slice().sort((a, b) => b.rate - a.rate)[0];

    // accrue interest
    for (const d of candidates) {
      const i = d.balance * d.rate;
      d.balance += i;
      interest += i;
    }

    // pay minimums to all, focus extra on focus debt
    let remaining = budget;
    for (const d of candidates) {
      const pay = Math.min(d.balance, d.min);
      d.balance -= pay;
      remaining -= pay;
    }
    if (remaining > 0) {
      const f = candidates.find((d) => d.id === focus.id);
      if (f) {
        const pay = Math.min(f.balance, remaining);
        f.balance -= pay;
        remaining -= pay;
      }
    }

    for (const d of candidates) {
      if (d.balance <= 0.01) {
        d.balance = 0;
        if (!order.includes(d.id)) order.push(d.id);
      }
    }
    months++;
  }
  return { order, monthsToFreedom: months, totalInterestEstimated: interest };
}

// Savings simulator: how much can you save in N months with a given monthly amount?
export function simulateSavings(monthlyAmount: number, months: number, annualRate = 0): number {
  if (annualRate <= 0) return monthlyAmount * months;
  const r = annualRate / 100 / 12;
  // Future value of an annuity-due ish — simple ordinary annuity
  return monthlyAmount * ((Math.pow(1 + r, months) - 1) / r);
}

// Top categories
export function topCategories(transactions: Transaction[], mKey: string, limit = 5): Array<{ category: string; total: number }> {
  const byCat = expensesByCategory(transactions, mKey);
  return Object.entries(byCat)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// Detect "hormiga" (ant) expenses — small frequent expenses that add up.
export function detectAntExpenses(transactions: Transaction[], mKey: string, threshold = 80): { count: number; total: number; items: Transaction[] } {
  const monthTx = getMonthTransactions(transactions, mKey).filter(
    (t) => t.type === "expense" && t.amount <= threshold
  );
  const total = monthTx.reduce((acc, t) => acc + t.amount, 0);
  return { count: monthTx.length, total, items: monthTx };
}

export function recurringSubscriptions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(
    (t) => t.type === "expense" && (t.isRecurring || t.category === "Suscripciones")
  );
}
