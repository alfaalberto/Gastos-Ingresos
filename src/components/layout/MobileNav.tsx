"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus } from "lucide-react";
import { MOBILE_EXTRA_ITEMS, NAV_ITEMS } from "./navigation";
import { Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [openTx, setOpenTx] = useState(false);
  const [openMore, setOpenMore] = useState(false);
  const pinned = NAV_ITEMS.filter((i) => i.mobile);
  const left = pinned.slice(0, 2);
  const right = pinned.slice(2);

  const renderTab = (item: (typeof pinned)[number]) => {
    const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium",
          active ? "text-brand-700 dark:text-brand-300" : "text-ink-500 dark:text-ink-400"
        )}
      >
        <Icon className={cn("h-5 w-5", active && "text-brand-600 dark:text-brand-400")} />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur-md lg:hidden dark:border-ink-800 dark:bg-ink-950/90">
        <div className="mx-auto grid max-w-md grid-cols-5 items-stretch px-1 py-1.5">
          {left.map(renderTab)}
          <button
            onClick={() => setOpenTx(true)}
            aria-label="Registrar movimiento"
            className="flex flex-col items-center justify-center"
          >
            <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg ring-4 ring-white transition active:scale-95 dark:ring-ink-950">
              <Plus className="h-5 w-5" />
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-ink-500 dark:text-ink-400">Registrar</span>
          </button>
          {right.map(renderTab)}
          <button
            onClick={() => setOpenMore(true)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium text-ink-500 dark:text-ink-400"
            aria-label="Más secciones"
          >
            <LayoutGrid className="h-5 w-5" />
            Más
          </button>
        </div>
      </nav>

      {/* Quick capture */}
      <Modal open={openTx} onClose={() => setOpenTx(false)} title="Registrar movimiento" description="Captura rápida — ingreso, gasto o transferencia." size="lg">
        <TransactionForm onClose={() => setOpenTx(false)} />
      </Modal>

      {/* "Más" sheet with every other section */}
      <Modal open={openMore} onClose={() => setOpenMore(false)} title="Todas las secciones" size="md">
        <div className="grid grid-cols-3 gap-2">
          {MOBILE_EXTRA_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenMore(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center text-[11px] font-medium transition",
                  active
                    ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-ink-100 text-ink-600 hover:bg-ink-50 dark:border-ink-800 dark:text-ink-300 dark:hover:bg-ink-800/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
