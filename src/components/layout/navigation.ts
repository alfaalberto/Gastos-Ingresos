// Centralized navigation definition shared between sidebar and mobile bar.

import {
  ArrowLeftRight,
  Banknote,
  Calendar,
  CreditCard,
  LayoutDashboard,
  PieChart,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight, mobile: true },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/gastos", label: "Gastos", icon: TrendingDown },
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet, mobile: true },
  { href: "/deudas", label: "Deudas", icon: CreditCard },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/cuentas", label: "Cuentas", icon: Banknote },
  { href: "/reportes", label: "Reportes", icon: PieChart, mobile: true },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
