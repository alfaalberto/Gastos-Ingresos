// Centralized navigation definition shared between sidebar and mobile bar.

import {
  ArrowLeftRight,
  LayoutDashboard,
  Settings,
  Wallet,
  HelpCircle,
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
  { href: "/presupuestos", label: "Presupuestos", icon: Wallet, mobile: true },
  { href: "/configuracion", label: "Configuración", icon: Settings, mobile: true },
  { href: "/ayuda", label: "Ayuda y Manual", icon: HelpCircle },
];

