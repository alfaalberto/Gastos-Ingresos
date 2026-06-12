// Centralized navigation definition shared between sidebar and mobile bar.

import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  Banknote,
  CalendarDays,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Settings,
  Target,
  Wallet,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: any;
  /** Shows as a fixed tab in the mobile bottom bar */
  mobile?: boolean;
  /** Section header used to group items in the sidebar */
  group?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Día a día
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true, group: "Día a día" },
  { href: "/movimientos", label: "Movimientos", icon: ArrowLeftRight, mobile: true, group: "Día a día" },
  { href: "/ingresos", label: "Ingresos", icon: ArrowUpRight, group: "Día a día" },
  { href: "/gastos", label: "Gastos", icon: ArrowDownRight, group: "Día a día" },
  // Planificación
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet, group: "Planificación" },
  { href: "/deudas", label: "Deudas", icon: Banknote, group: "Planificación" },
  { href: "/metas", label: "Metas de ahorro", icon: Target, group: "Planificación" },
  { href: "/calendario", label: "Calendario", icon: CalendarDays, group: "Planificación" },
  // Patrimonio
  { href: "/cuentas", label: "Cuentas", icon: Landmark, group: "Patrimonio" },
  { href: "/reportes", label: "Reportes", icon: BarChart3, mobile: true, group: "Patrimonio" },
  // Sistema
  { href: "/configuracion", label: "Configuración", icon: Settings, group: "Sistema" },
  { href: "/ayuda", label: "Ayuda y Manual", icon: HelpCircle, group: "Sistema" },
];

export const NAV_GROUPS = ["Día a día", "Planificación", "Patrimonio", "Sistema"] as const;

// Items that live behind the "Más" sheet on mobile (everything not pinned).
export const MOBILE_EXTRA_ITEMS = NAV_ITEMS.filter((i) => !i.mobile);

