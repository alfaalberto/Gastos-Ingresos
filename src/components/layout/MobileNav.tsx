"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => i.mobile);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-100 bg-white/95 backdrop-blur-md lg:hidden dark:border-ink-800 dark:bg-ink-950/90">
      <div className="mx-auto grid max-w-md grid-cols-4 items-stretch px-1 py-1.5">
        {items.map((item) => {
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
        })}
      </div>
    </nav>
  );
}
