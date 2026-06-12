// Realistic demo data so the dashboard feels alive on first run.

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
import { monthKey, nowISO } from "@/lib/utils";

// --- Default categories ---
export const DEFAULT_INCOME_CATEGORIES: CategoryDef[] = [
  { id: "ic-salary", name: "Sueldo", kind: "income", color: "#10b981", icon: "Briefcase", isDefault: true },
  { id: "ic-fees", name: "Honorarios", kind: "income", color: "#22c55e", icon: "FileText", isDefault: true },
  { id: "ic-freelance", name: "Freelance", kind: "income", color: "#14b8a6", icon: "Laptop", isDefault: true },
  { id: "ic-trading", name: "Trading", kind: "income", color: "#06b6d4", icon: "TrendingUp", isDefault: true },
  { id: "ic-rent", name: "Renta", kind: "income", color: "#0ea5e9", icon: "Home", isDefault: true },
  { id: "ic-sales", name: "Ventas", kind: "income", color: "#3b82f6", icon: "ShoppingBag", isDefault: true },
  { id: "ic-bonus", name: "Bonos", kind: "income", color: "#8b5cf6", icon: "Gift", isDefault: true },
  { id: "ic-invest", name: "Inversiones", kind: "income", color: "#a855f7", icon: "LineChart", isDefault: true },
  { id: "ic-other", name: "Otros", kind: "income", color: "#94a3b8", icon: "Sparkles", isDefault: true },
];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: "ec-housing", name: "Vivienda", kind: "expense", color: "#3258f5", icon: "Home", isDefault: true, subcategories: ["Renta", "Hipoteca", "Mantenimiento", "Mobiliario"] },
  { id: "ec-food", name: "Comida", kind: "expense", color: "#f59e0b", icon: "Utensils", isDefault: true, subcategories: ["Súper", "Restaurantes", "Cafetería", "Delivery", "Chicles & snacks"] },
  { id: "ec-transport", name: "Transporte", kind: "expense", color: "#0ea5e9", icon: "Car", isDefault: true, subcategories: ["Gasolina", "Uber/Taxi", "Transporte público", "Mantenimiento"] },
  { id: "ec-health", name: "Salud", kind: "expense", color: "#ef4444", icon: "HeartPulse", isDefault: true, subcategories: ["Médico", "Farmacia", "Gimnasio", "Seguro"] },
  { id: "ec-education", name: "Educación", kind: "expense", color: "#8b5cf6", icon: "GraduationCap", isDefault: true, subcategories: ["Cursos", "Libros", "Colegiatura"] },
  { id: "ec-services", name: "Servicios", kind: "expense", color: "#06b6d4", icon: "Plug", isDefault: true, subcategories: ["Luz", "Agua", "Internet", "Gas", "Teléfono"] },
  { id: "ec-debts", name: "Deudas", kind: "expense", color: "#7c3aed", icon: "Banknote", isDefault: true },
  { id: "ec-entertainment", name: "Entretenimiento", kind: "expense", color: "#ec4899", icon: "Film", isDefault: true, subcategories: ["Cine", "Conciertos", "Bares", "Juegos"] },
  { id: "ec-subscriptions", name: "Suscripciones", kind: "expense", color: "#a855f7", icon: "Repeat", isDefault: true, subcategories: ["Streaming", "Software", "Cloud"] },
  { id: "ec-clothing", name: "Ropa", kind: "expense", color: "#f43f5e", icon: "Shirt", isDefault: true },
  { id: "ec-pets", name: "Mascotas", kind: "expense", color: "#84cc16", icon: "PawPrint", isDefault: true },
  { id: "ec-family", name: "Familia", kind: "expense", color: "#eab308", icon: "Users", isDefault: true },
  { id: "ec-travel", name: "Viajes", kind: "expense", color: "#14b8a6", icon: "Plane", isDefault: true },
  { id: "ec-taxes", name: "Impuestos", kind: "expense", color: "#64748b", icon: "Receipt", isDefault: true },
  { id: "ec-trading", name: "Trading", kind: "expense", color: "#0284c7", icon: "TrendingDown", isDefault: true },
  { id: "ec-business", name: "Negocio", kind: "expense", color: "#0d9488", icon: "Building2", isDefault: true },
  { id: "ec-other", name: "Otros", kind: "expense", color: "#94a3b8", icon: "MoreHorizontal", isDefault: true },
];

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
];

export const DEFAULT_SETTINGS: Settings = {
  currency: "MXN",
  locale: "es-MX",
  dateFormat: "dd/MM/yyyy",
  theme: "system",
  savingsTargetPct: 20,
  monthlyBudgetTotal: 35000,
  privacyMode: false,
  notifications: {
    budgetAlerts: true,
    debtReminders: true,
    unusualSpending: true,
    goalsAtRisk: true,
  },
  emergencyFundMonths: 3,
};

// --- Mock entities ---
const today = new Date();
const cmKey = monthKey(today);

function dateISO(y: number, m: number, d: number): string {
  return new Date(y, m - 1, d).toISOString().slice(0, 10);
}

function relativeDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc-bbva",
    name: "BBVA Cuenta",
    type: "bank",
    initialBalance: 24800,
    currency: "MXN",
    institution: "BBVA",
    color: "#0F4C81",
    isActive: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "acc-cash",
    name: "Efectivo",
    type: "cash",
    initialBalance: 1500,
    currency: "MXN",
    color: "#10b981",
    isActive: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "acc-amex",
    name: "Amex Platinum",
    type: "credit",
    initialBalance: 0,
    currency: "MXN",
    institution: "American Express",
    color: "#1f2937",
    isActive: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "acc-mercado",
    name: "Mercado Pago",
    type: "wallet",
    initialBalance: 3200,
    currency: "MXN",
    institution: "Mercado Pago",
    color: "#FFE600",
    isActive: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "acc-broker",
    name: "GBM Inversiones",
    type: "investment",
    initialBalance: 18000,
    currency: "MXN",
    institution: "GBM",
    color: "#7c3aed",
    isActive: true,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  // --- Current month (this month) ---
  { id: "tx-1", type: "income", name: "Sueldo quincenal", amount: 22000, date: relativeDate(2), category: "Sueldo", source: "Empresa ACME", accountId: "acc-bbva", paymentMethod: "Transferencia", isRecurring: true, frequency: "biweekly", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-2", type: "income", name: "Proyecto freelance UI", amount: 8500, date: relativeDate(8), category: "Freelance", source: "Cliente Madrid", accountId: "acc-bbva", paymentMethod: "Transferencia", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-3", type: "expense", name: "Renta departamento", amount: 12500, date: relativeDate(28), category: "Vivienda", subcategory: "Renta", accountId: "acc-bbva", paymentMethod: "Transferencia", isFixed: true, isRecurring: true, frequency: "monthly", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-4", type: "expense", name: "Súper Walmart", amount: 1860, date: relativeDate(5), category: "Comida", subcategory: "Súper", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-5", type: "expense", name: "Café Starbucks", amount: 78, date: relativeDate(1), category: "Comida", subcategory: "Cafetería", accountId: "acc-amex", paymentMethod: "Crédito", nature: "optional", tags: ["café"], createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-6", type: "expense", name: "Café Starbucks", amount: 82, date: relativeDate(3), category: "Comida", subcategory: "Cafetería", accountId: "acc-amex", paymentMethod: "Crédito", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-7", type: "expense", name: "Gasolina Pemex", amount: 950, date: relativeDate(6), category: "Transporte", subcategory: "Gasolina", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-8", type: "expense", name: "Uber al aeropuerto", amount: 320, date: relativeDate(4), category: "Transporte", subcategory: "Uber/Taxi", accountId: "acc-mercado", paymentMethod: "Wallet", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-9", type: "expense", name: "Netflix", amount: 269, date: relativeDate(10), category: "Suscripciones", subcategory: "Streaming", accountId: "acc-amex", paymentMethod: "Crédito", isRecurring: true, isFixed: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-10", type: "expense", name: "Spotify", amount: 119, date: relativeDate(11), category: "Suscripciones", subcategory: "Streaming", accountId: "acc-amex", paymentMethod: "Crédito", isRecurring: true, isFixed: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-11", type: "expense", name: "Internet Totalplay", amount: 599, date: relativeDate(12), category: "Servicios", subcategory: "Internet", accountId: "acc-bbva", paymentMethod: "Domiciliado", isFixed: true, isRecurring: true, frequency: "monthly", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-12", type: "expense", name: "Luz CFE", amount: 720, date: relativeDate(15), category: "Servicios", subcategory: "Luz", accountId: "acc-bbva", paymentMethod: "Domiciliado", isFixed: true, isRecurring: true, frequency: "bimonthly", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-13", type: "expense", name: "Cine + palomitas", amount: 360, date: relativeDate(7), category: "Entretenimiento", subcategory: "Cine", accountId: "acc-amex", paymentMethod: "Crédito", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-14", type: "expense", name: "Chicles Trident", amount: 28, date: relativeDate(2), category: "Comida", subcategory: "Chicles & snacks", accountId: "acc-cash", paymentMethod: "Efectivo", nature: "impulsive", tags: ["hormiga"], createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-15", type: "expense", name: "Chicles & dulces OXXO", amount: 35, date: relativeDate(9), category: "Comida", subcategory: "Chicles & snacks", accountId: "acc-cash", paymentMethod: "Efectivo", nature: "impulsive", tags: ["hormiga"], createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-16", type: "expense", name: "Snacks 7-Eleven", amount: 65, date: relativeDate(14), category: "Comida", subcategory: "Chicles & snacks", accountId: "acc-cash", paymentMethod: "Efectivo", nature: "impulsive", tags: ["hormiga"], createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-17", type: "expense", name: "Almuerzo Comida Corrida", amount: 145, date: relativeDate(3), category: "Comida", subcategory: "Restaurantes", accountId: "acc-cash", paymentMethod: "Efectivo", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-18", type: "expense", name: "Cena con amigos", amount: 680, date: relativeDate(8), category: "Comida", subcategory: "Restaurantes", accountId: "acc-amex", paymentMethod: "Crédito", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-19", type: "expense", name: "Pago tarjeta crédito (mínimo)", amount: 2500, date: relativeDate(20), category: "Deudas", accountId: "acc-bbva", paymentMethod: "Transferencia", isFixed: true, isRecurring: true, frequency: "monthly", nature: "necessary", debtId: "debt-amex", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-20", type: "expense", name: "Farmacia del Ahorro", amount: 240, date: relativeDate(6), category: "Salud", subcategory: "Farmacia", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-21", type: "expense", name: "Gimnasio Smart Fit", amount: 399, date: relativeDate(18), category: "Salud", subcategory: "Gimnasio", accountId: "acc-bbva", paymentMethod: "Domiciliado", isFixed: true, isRecurring: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-22", type: "expense", name: "iCloud 200GB", amount: 49, date: relativeDate(13), category: "Suscripciones", subcategory: "Cloud", accountId: "acc-amex", paymentMethod: "Crédito", isFixed: true, isRecurring: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-23", type: "expense", name: "Adobe Creative Cloud", amount: 449, date: relativeDate(16), category: "Suscripciones", subcategory: "Software", accountId: "acc-amex", paymentMethod: "Crédito", isFixed: true, isRecurring: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-24", type: "expense", name: "Curso de inglés online", amount: 850, date: relativeDate(22), category: "Educación", subcategory: "Cursos", accountId: "acc-bbva", paymentMethod: "Transferencia", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-25", type: "expense", name: "Croquetas mascota", amount: 720, date: relativeDate(11), category: "Mascotas", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-26", type: "expense", name: "Aportación meta viaje", amount: 1500, date: relativeDate(1), category: "Otros", accountId: "acc-bbva", paymentMethod: "Transferencia", goalId: "goal-trip", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-27", type: "income", name: "Dividendo CETES", amount: 380, date: relativeDate(15), category: "Inversiones", source: "GBM", accountId: "acc-broker", paymentMethod: "Acreditación", createdAt: nowISO(), updatedAt: nowISO() },

  // --- Previous month for comparison ---
  { id: "tx-p1", type: "income", name: "Sueldo quincenal", amount: 22000, date: dateISO(today.getFullYear(), today.getMonth(), 1), category: "Sueldo", source: "Empresa ACME", accountId: "acc-bbva", paymentMethod: "Transferencia", isRecurring: true, frequency: "biweekly", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p2", type: "income", name: "Sueldo quincenal", amount: 22000, date: dateISO(today.getFullYear(), today.getMonth(), 15), category: "Sueldo", source: "Empresa ACME", accountId: "acc-bbva", paymentMethod: "Transferencia", isRecurring: true, frequency: "biweekly", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p3", type: "expense", name: "Renta departamento", amount: 12500, date: dateISO(today.getFullYear(), today.getMonth(), 3), category: "Vivienda", subcategory: "Renta", accountId: "acc-bbva", paymentMethod: "Transferencia", isFixed: true, isRecurring: true, frequency: "monthly", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p4", type: "expense", name: "Súper", amount: 2100, date: dateISO(today.getFullYear(), today.getMonth(), 8), category: "Comida", subcategory: "Súper", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p5", type: "expense", name: "Gasolina", amount: 1100, date: dateISO(today.getFullYear(), today.getMonth(), 12), category: "Transporte", subcategory: "Gasolina", accountId: "acc-bbva", paymentMethod: "Débito", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p6", type: "expense", name: "Netflix", amount: 269, date: dateISO(today.getFullYear(), today.getMonth(), 10), category: "Suscripciones", subcategory: "Streaming", accountId: "acc-amex", paymentMethod: "Crédito", isFixed: true, isRecurring: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p7", type: "expense", name: "Spotify", amount: 119, date: dateISO(today.getFullYear(), today.getMonth(), 11), category: "Suscripciones", subcategory: "Streaming", accountId: "acc-amex", paymentMethod: "Crédito", isFixed: true, isRecurring: true, frequency: "monthly", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-p8", type: "expense", name: "Internet Totalplay", amount: 599, date: dateISO(today.getFullYear(), today.getMonth(), 12), category: "Servicios", subcategory: "Internet", accountId: "acc-bbva", paymentMethod: "Domiciliado", isFixed: true, isRecurring: true, frequency: "monthly", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },

  // Two months ago
  { id: "tx-pp1", type: "income", name: "Sueldo", amount: 44000, date: dateISO(today.getFullYear(), today.getMonth() - 1, 1), category: "Sueldo", accountId: "acc-bbva", paymentMethod: "Transferencia", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-pp2", type: "expense", name: "Renta", amount: 12500, date: dateISO(today.getFullYear(), today.getMonth() - 1, 3), category: "Vivienda", subcategory: "Renta", accountId: "acc-bbva", isFixed: true, nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-pp3", type: "expense", name: "Súper", amount: 1950, date: dateISO(today.getFullYear(), today.getMonth() - 1, 10), category: "Comida", subcategory: "Súper", accountId: "acc-bbva", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-pp4", type: "expense", name: "Restaurantes", amount: 1280, date: dateISO(today.getFullYear(), today.getMonth() - 1, 14), category: "Comida", subcategory: "Restaurantes", accountId: "acc-amex", nature: "optional", createdAt: nowISO(), updatedAt: nowISO() },
  { id: "tx-pp5", type: "expense", name: "Transporte", amount: 1450, date: dateISO(today.getFullYear(), today.getMonth() - 1, 18), category: "Transporte", subcategory: "Gasolina", accountId: "acc-bbva", nature: "necessary", createdAt: nowISO(), updatedAt: nowISO() },
];

export const MOCK_BUDGETS: Budget[] = [
  { id: "b-food", category: "Comida", monthlyLimit: 4500, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "b-transport", category: "Transporte", monthlyLimit: 2000, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "b-ent", category: "Entretenimiento", monthlyLimit: 800, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "b-subs", category: "Suscripciones", monthlyLimit: 1000, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "b-health", category: "Salud", monthlyLimit: 1200, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "b-housing", category: "Vivienda", monthlyLimit: 13000, month: cmKey, createdAt: nowISO(), updatedAt: nowISO() },
];

export const MOCK_DEBTS: Debt[] = [
  {
    id: "debt-amex",
    name: "Tarjeta Amex",
    institution: "American Express",
    originalAmount: 45000,
    currentBalance: 28500,
    interestRate: 49,
    minimumPayment: 2500,
    plannedPayment: 4000,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString().slice(0, 10); })(),
    status: "active",
    strategy: "avalanche",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "debt-auto",
    name: "Crédito Auto",
    institution: "Banorte",
    originalAmount: 180000,
    currentBalance: 96000,
    interestRate: 12.5,
    minimumPayment: 4500,
    plannedPayment: 4500,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 18); return d.toISOString().slice(0, 10); })(),
    status: "active",
    strategy: "fixed",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "debt-perso",
    name: "Préstamo personal",
    institution: "Nu",
    originalAmount: 20000,
    currentBalance: 6500,
    interestRate: 35,
    minimumPayment: 1200,
    plannedPayment: 2000,
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 25); return d.toISOString().slice(0, 10); })(),
    status: "active",
    strategy: "snowball",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: "goal-emergency",
    name: "Fondo de emergencia",
    targetAmount: 90000,
    currentAmount: 22500,
    targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 12); return d.toISOString().slice(0, 10); })(),
    priority: "high",
    category: "Ahorro",
    icon: "ShieldCheck",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "goal-trip",
    name: "Viaje Europa 2026",
    targetAmount: 60000,
    currentAmount: 18000,
    targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 10); return d.toISOString().slice(0, 10); })(),
    priority: "medium",
    category: "Viaje",
    icon: "Plane",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "goal-equipo",
    name: "MacBook Pro",
    targetAmount: 45000,
    currentAmount: 12000,
    targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 8); return d.toISOString().slice(0, 10); })(),
    priority: "medium",
    category: "Equipo",
    icon: "Laptop",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "goal-invest",
    name: "Aporte mensual a inversiones",
    targetAmount: 36000,
    currentAmount: 6000,
    targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 11); return d.toISOString().slice(0, 10); })(),
    priority: "low",
    category: "Inversión",
    icon: "LineChart",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

export const MOCK_STATE: FinanceState = {
  transactions: MOCK_TRANSACTIONS,
  accounts: MOCK_ACCOUNTS,
  budgets: MOCK_BUDGETS,
  debts: MOCK_DEBTS,
  goals: MOCK_GOALS,
  categories: DEFAULT_CATEGORIES,
  settings: DEFAULT_SETTINGS,
  isDemoData: true,
};

export const PAYMENT_METHODS = [
  "Efectivo",
  "Débito",
  "Crédito",
  "Transferencia",
  "Domiciliado",
  "Wallet",
  "Cheque",
  "Otro",
];
