// Lightweight runtime validators for forms. Returns map of field -> message.

import type { Transaction, Account, Budget, Debt, Goal } from "@/types/finance";

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateTransaction(t: Partial<Transaction>): ValidationErrors<Transaction> {
  const e: ValidationErrors<Transaction> = {};
  if (!t.name || t.name.trim().length < 1) e.name = "Escribe un nombre.";
  if (t.amount == null || !isFinite(t.amount) || t.amount <= 0) e.amount = "Monto debe ser mayor a 0.";
  if (!t.date) e.date = "Selecciona una fecha.";
  if (!t.category) e.category = "Selecciona una categoría.";
  if (!t.type) e.type = "Selecciona tipo.";
  if (t.type === "transfer") {
    if (!t.accountId) e.accountId = "Cuenta origen requerida.";
    if (!t.toAccountId) e.toAccountId = "Cuenta destino requerida.";
    if (t.accountId && t.toAccountId && t.accountId === t.toAccountId) {
      e.toAccountId = "Debe ser distinta a la cuenta origen.";
    }
  }
  return e;
}

export function validateAccount(a: Partial<Account>): ValidationErrors<Account> {
  const e: ValidationErrors<Account> = {};
  if (!a.name || a.name.trim().length < 1) e.name = "Nombre requerido.";
  if (!a.type) e.type = "Tipo requerido.";
  if (a.initialBalance == null || isNaN(a.initialBalance)) e.initialBalance = "Saldo inicial inválido.";
  if (!a.currency) e.currency = "Moneda requerida.";
  return e;
}

export function validateBudget(b: Partial<Budget>): ValidationErrors<Budget> {
  const e: ValidationErrors<Budget> = {};
  if (!b.category) e.category = "Categoría requerida.";
  if (!b.monthlyLimit || b.monthlyLimit <= 0) e.monthlyLimit = "Límite debe ser mayor a 0.";
  if (!b.month) e.month = "Mes requerido.";
  return e;
}

export function validateDebt(d: Partial<Debt>): ValidationErrors<Debt> {
  const e: ValidationErrors<Debt> = {};
  if (!d.name) e.name = "Nombre requerido.";
  if (!d.institution) e.institution = "Institución requerida.";
  if (!d.originalAmount || d.originalAmount <= 0) e.originalAmount = "Monto original inválido.";
  if (d.currentBalance == null || d.currentBalance < 0) e.currentBalance = "Saldo inválido.";
  if (!d.minimumPayment || d.minimumPayment < 0) e.minimumPayment = "Pago mínimo inválido.";
  if (!d.dueDate) e.dueDate = "Fecha límite requerida.";
  return e;
}

export function validateGoal(g: Partial<Goal>): ValidationErrors<Goal> {
  const e: ValidationErrors<Goal> = {};
  if (!g.name) e.name = "Nombre requerido.";
  if (!g.targetAmount || g.targetAmount <= 0) e.targetAmount = "Monto objetivo inválido.";
  if (g.currentAmount == null || g.currentAmount < 0) e.currentAmount = "Monto actual inválido.";
  if (!g.targetDate) e.targetDate = "Fecha objetivo requerida.";
  if (!g.priority) e.priority = "Prioridad requerida.";
  return e;
}

export function hasErrors<T>(errors: ValidationErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
