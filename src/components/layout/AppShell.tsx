"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 dark:bg-ink-950 transition-colors duration-300">
        <div className="flex flex-col items-center max-w-sm px-6 py-8 text-center animate-fade-in">
          {/* Logo Brand Container */}
          <div className="relative mb-6 flex items-center justify-center">
            {/* Outer Glowing Ring */}
            <div className="absolute inset-0 -m-3 animate-pulse rounded-full bg-brand-500/10 blur-xl"></div>
            {/* Spinner Container */}
            <div className="relative h-16 w-16 flex items-center justify-center">
              {/* Spinner Background Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-brand-100 dark:border-brand-900/30"></div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              {/* Inner Center Dot/Icon */}
              <div className="h-6 w-6 rounded-full bg-brand-500 shadow-md shadow-brand-500/30"></div>
            </div>
          </div>
          
          <h1 className="text-xl font-bold tracking-tight text-ink-900 dark:text-ink-50">
            Finanza<span className="text-brand-500">Pro</span>
          </h1>
          <p className="mt-2 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-widest animate-pulse">
            Iniciando panel seguro...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} subtitle={subtitle} />
          <main className="flex-1 px-4 pb-24 pt-4 sm:px-6 lg:pb-8 lg:pt-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
