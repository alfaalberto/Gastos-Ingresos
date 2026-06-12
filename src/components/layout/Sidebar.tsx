"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { NAV_GROUPS, NAV_ITEMS } from "./navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col gap-1 overflow-y-auto border-r border-ink-100 bg-white px-3 py-5 dark:border-ink-800 dark:bg-ink-950">
      <Link href="/" className="mx-2 mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-md">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-ink-900 dark:text-ink-50">FinanzaPro</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-ink-500 dark:text-ink-400">Premium</div>
        </div>
      </Link>

      <nav className="mt-2 flex flex-1 flex-col gap-0.5">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mb-2">
            <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
              {group}
            </div>
            {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800/60 dark:hover:text-ink-50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition", active ? "text-brand-600 dark:text-brand-300" : "text-ink-500 group-hover:text-ink-800 dark:text-ink-400 dark:group-hover:text-ink-100")} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-2 rounded-xl border border-ink-100 bg-gradient-to-br from-brand-50 to-white p-3 dark:border-ink-800 dark:from-brand-900/30 dark:to-ink-900">
        <div className="text-xs font-medium text-ink-700 dark:text-ink-100">¿Sabías que…?</div>
        <div className="mt-1 text-[11px] leading-snug text-ink-500 dark:text-ink-400">
          Hasta los gastos pequeños como un chicle cuentan. FinanzaPro detecta tus gastos hormiga.
        </div>
      </div>
    </aside>
  );
}
