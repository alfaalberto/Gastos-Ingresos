// Core financial model types — single source of truth across the app.

export type TransactionType = "income" | "expense" | "transfer";

export type Frequency =
  | "once"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "yearly"
  | "custom";

export type ExpenseNature =
  | "necessary"
  | "optional"
  | "impulsive"
  | "recurring"
  | "deductible"
  | "critical"
  | "avoidable";

export type AccountType =
  | "cash"
  | "bank"
  | "debit"
  | "credit"
  | "investment"
  | "wallet"
  | "trading"
  | "other";

export type DebtStrategy = "snowball" | "avalanche" | "fixed" | "custom";

export type DebtStatus = "active" | "paid" | "overdue" | "paused";

export type GoalPriority = "low" | "medium" | "high";

export type ThemeMode = "light" | "dark" | "system";

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  date: string; // ISO date (YYYY-MM-DD)
  category: string;
  subcategory?: string;
  accountId?: string;
  // For transfers
  toAccountId?: string;
  paymentMethod?: string;
  source?: string; // income source
  isRecurring?: boolean;
  frequency?: Frequency;
  isFixed?: boolean;
  nature?: ExpenseNature;
  tags?: string[];
  notes?: string;
  // Optional links
  debtId?: string; // payment toward a debt
  goalId?: string; // contribution to a goal
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: string;
  institution?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name: string;
  institution: string;
  originalAmount: number;
  currentBalance: number;
  interestRate?: number; // annual %
  minimumPayment: number;
  plannedPayment?: number;
  dueDate: string; // next payment due date
  payoffDate?: string;
  status: DebtStatus;
  strategy?: DebtStrategy;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: GoalPriority;
  category?: string;
  icon?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDef {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string;
  icon?: string;
  subcategories?: string[];
  isDefault?: boolean;
}

export interface Settings {
  currency: string; // e.g. MXN, USD
  locale: string; // e.g. es-MX
  dateFormat: string; // e.g. dd/MM/yyyy
  theme: ThemeMode;
  savingsTargetPct: number; // 0..100 monthly savings target
  monthlyBudgetTotal?: number;
  privacyMode: boolean; // hide amounts
  notifications: {
    budgetAlerts: boolean;
    debtReminders: boolean;
    unusualSpending: boolean;
    goalsAtRisk: boolean;
  };
  emergencyFundMonths: number; // recommended months of expenses to keep
}

export interface FinanceState {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  debts: Debt[];
  goals: Goal[];
  categories: CategoryDef[];
  settings: Settings;
}
