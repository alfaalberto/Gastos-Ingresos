// Global finance store using Zustand with persistence to localStorage.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Account,
  Budget,
  CategoryDef,
  Debt,
  FinanceState,
  Goal,
  Settings,
  Transaction,
} from "@/types/finance";
import { nowISO, todayISODate, uid } from "@/lib/utils";
import { MOCK_STATE } from "@/data/mockData";

interface Actions {
  // Transactions
  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  duplicateTransaction: (id: string) => Transaction | null;
  bulkAddTransactions: (txs: Transaction[]) => void;

  // Accounts
  addAccount: (a: Omit<Account, "id" | "createdAt" | "updatedAt">) => Account;
  updateAccount: (id: string, patch: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Budgets
  upsertBudget: (b: Omit<Budget, "id" | "createdAt" | "updatedAt"> & { id?: string }) => Budget;
  deleteBudget: (id: string) => void;

  // Debts
  addDebt: (d: Omit<Debt, "id" | "createdAt" | "updatedAt">) => Debt;
  updateDebt: (id: string, patch: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  applyDebtPayment: (debtId: string, amount: number, accountId?: string) => void;

  // Goals
  addGoal: (g: Omit<Goal, "id" | "createdAt" | "updatedAt">) => Goal;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, accountId?: string) => void;

  // Categories
  addCategory: (c: Omit<CategoryDef, "id">) => CategoryDef;
  updateCategory: (id: string, patch: Partial<CategoryDef>) => void;
  deleteCategory: (id: string) => void;

  // Settings
  updateSettings: (patch: Partial<Settings>) => void;
  setTheme: (theme: Settings["theme"]) => void;
  togglePrivacy: () => void;

  // Bulk ops
  resetToMock: () => void;
  clearAll: () => void;
  importState: (state: Partial<FinanceState>) => void;
  dismissDemo: () => void;
}

export type FinanceStore = FinanceState & Actions;

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      ...MOCK_STATE,

      // --- Transactions ---
      addTransaction: (t) => {
        const tx: Transaction = { ...t, id: uid("tx"), createdAt: nowISO(), updatedAt: nowISO() };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        return tx;
      },
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowISO() } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      duplicateTransaction: (id) => {
        const original = get().transactions.find((t) => t.id === id);
        if (!original) return null;
        const dup: Transaction = {
          ...original,
          id: uid("tx"),
          name: `${original.name} (copia)`,
          date: todayISODate(),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ transactions: [dup, ...s.transactions] }));
        return dup;
      },
      bulkAddTransactions: (txs) =>
        set((s) => {
          // Idempotent import: skip rows whose id already exists (e.g. re-importing
          // a previously exported CSV must not duplicate data).
          const existing = new Set(s.transactions.map((t) => t.id));
          const fresh = txs.filter((t) => !existing.has(t.id));
          return { transactions: [...fresh, ...s.transactions] };
        }),

      // --- Accounts ---
      addAccount: (a) => {
        const account: Account = { ...a, id: uid("acc"), createdAt: nowISO(), updatedAt: nowISO() };
        set((s) => ({ accounts: [account, ...s.accounts] }));
        return account;
      },
      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: nowISO() } : a)),
        })),
      deleteAccount: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      // --- Budgets ---
      upsertBudget: (b) => {
        const existingId = b.id;
        if (existingId) {
          set((s) => ({
            budgets: s.budgets.map((x) =>
              x.id === existingId ? { ...x, ...b, updatedAt: nowISO() } : x
            ),
          }));
          return get().budgets.find((x) => x.id === existingId) as Budget;
        }
        const budget: Budget = { ...b, id: uid("bud"), createdAt: nowISO(), updatedAt: nowISO() };
        set((s) => ({ budgets: [budget, ...s.budgets] }));
        return budget;
      },
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),

      // --- Debts ---
      addDebt: (d) => {
        const debt: Debt = { ...d, id: uid("debt"), createdAt: nowISO(), updatedAt: nowISO() };
        set((s) => ({ debts: [debt, ...s.debts] }));
        return debt;
      },
      updateDebt: (id, patch) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: nowISO() } : d)),
        })),
      deleteDebt: (id) => set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),
      applyDebtPayment: (debtId, amount, accountId) => {
        const debt = get().debts.find((d) => d.id === debtId);
        if (!debt) return;
        const newBalance = Math.max(0, debt.currentBalance - amount);
        const isPaid = newBalance === 0;
        set((s) => ({
          debts: s.debts.map((d) =>
            d.id === debtId
              ? { ...d, currentBalance: newBalance, status: isPaid ? "paid" : d.status, updatedAt: nowISO() }
              : d
          ),
        }));
        const tx: Transaction = {
          id: uid("tx"),
          type: "expense",
          name: `Pago a ${debt.name}`,
          amount,
          date: todayISODate(),
          category: "Deudas",
          accountId,
          paymentMethod: "Transferencia",
          debtId,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
      },

      // --- Goals ---
      addGoal: (g) => {
        const goal: Goal = { ...g, id: uid("goal"), createdAt: nowISO(), updatedAt: nowISO() };
        set((s) => ({ goals: [goal, ...s.goals] }));
        return goal;
      },
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch, updatedAt: nowISO() } : g)),
        })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (goalId, amount, accountId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === goalId
              ? { ...g, currentAmount: g.currentAmount + amount, updatedAt: nowISO() }
              : g
          ),
        }));
        const tx: Transaction = {
          id: uid("tx"),
          type: "expense",
          name: `Aportación a ${goal.name}`,
          amount,
          date: todayISODate(),
          category: "Otros",
          accountId,
          paymentMethod: "Transferencia",
          goalId,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
      },

      // --- Categories ---
      addCategory: (c) => {
        const cat: CategoryDef = { ...c, id: uid("cat") };
        set((s) => ({ categories: [...s.categories, cat] }));
        return cat;
      },
      updateCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      // --- Settings ---
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      togglePrivacy: () =>
        set((s) => ({ settings: { ...s.settings, privacyMode: !s.settings.privacyMode } })),

      // --- Bulk ---
      resetToMock: () => set(() => ({ ...MOCK_STATE })),
      clearAll: () =>
        set((s) => ({
          transactions: [],
          budgets: [],
          debts: [],
          goals: [],
          accounts: [],
          // keep categories & settings
          categories: s.categories,
          settings: s.settings,
          isDemoData: false,
        })),
      importState: (state) =>
        set((s) => ({
          transactions: state.transactions ?? s.transactions,
          accounts: state.accounts ?? s.accounts,
          budgets: state.budgets ?? s.budgets,
          debts: state.debts ?? s.debts,
          goals: state.goals ?? s.goals,
          categories: state.categories ?? s.categories,
          settings: state.settings ?? s.settings,
          isDemoData: false,
        })),
      dismissDemo: () => set(() => ({ isDemoData: false })),
    }),
    {
      name: "finanzapro-store-v1",
      version: 1,
      merge: (persistedState: unknown, currentState: FinanceStore): FinanceStore => {
        if (!persistedState) return currentState;
        const persisted = persistedState as Partial<FinanceStore>;
        return {
          ...currentState,
          ...persisted,
          transactions: Array.isArray(persisted.transactions) ? persisted.transactions : currentState.transactions,
          accounts: Array.isArray(persisted.accounts) ? persisted.accounts : currentState.accounts,
          budgets: Array.isArray(persisted.budgets) ? persisted.budgets : currentState.budgets,
          debts: Array.isArray(persisted.debts) ? persisted.debts : currentState.debts,
          goals: Array.isArray(persisted.goals) ? persisted.goals : currentState.goals,
          categories: Array.isArray(persisted.categories) ? persisted.categories : currentState.categories,
          settings: {
            ...currentState.settings,
            ...(persisted.settings || {}),
            notifications: {
              ...(currentState.settings?.notifications || {}),
              ...(persisted.settings?.notifications || {}),
            }
          }
        } as FinanceStore;
      }
    }
  )
);

// Convenience selectors
export const selectIncomeCategories = (s: FinanceStore) =>
  s.categories.filter((c) => c.kind === "income");
export const selectExpenseCategories = (s: FinanceStore) =>
  s.categories.filter((c) => c.kind === "expense");
