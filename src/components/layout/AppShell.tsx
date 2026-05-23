"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
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
