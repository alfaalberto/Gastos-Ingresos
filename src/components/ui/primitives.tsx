"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "brand" | "gold";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  const variants = {
    default: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
    success: "bg-success/15 text-success-dark dark:bg-success/20 dark:text-success",
    warning: "bg-warn/15 text-warn-dark dark:bg-warn/20 dark:text-warn",
    danger: "bg-danger/15 text-danger-dark dark:bg-danger/20 dark:text-danger",
    info: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300",
    brand: "bg-brand-600 text-white",
    gold: "bg-gold-soft text-gold dark:bg-gold/20",
  } as const;
  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

interface ProgressProps {
  value: number; // 0..100
  max?: number;
  color?: "brand" | "success" | "warning" | "danger" | "gold";
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, color = "brand", size = "sm", showLabel, className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    brand: "bg-brand-600",
    success: "bg-success",
    warning: "bg-warn",
    danger: "bg-danger",
    gold: "bg-gold",
  } as const;
  const sizes = { xs: "h-1", sm: "h-1.5", md: "h-2.5" } as const;
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-ink-600 dark:text-ink-300">
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn("overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800", sizes[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink-100 dark:bg-ink-800", className)} />;
}

export function Empty({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-12 text-center dark:border-ink-700 dark:bg-ink-900/40">
      {icon && <div className="mb-1 text-ink-400">{icon}</div>}
      <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</h4>
      {description && <p className="max-w-sm text-xs text-ink-500 dark:text-ink-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  size?: "sm" | "md";
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, size = "md", className }: SegmentedProps<T>) {
  return (
    <div className={cn("inline-flex rounded-xl bg-ink-100 p-1 dark:bg-ink-800", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active
                ? "bg-white text-ink-900 shadow-sm dark:bg-ink-900 dark:text-ink-50"
                : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100"
            )}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface KpiProps {
  label: string;
  value: ReactNode;
  delta?: { value: number; positive?: boolean };
  icon?: ReactNode;
  hint?: ReactNode;
  accent?: "brand" | "success" | "danger" | "warning" | "gold" | "neutral";
}

export function KpiCard({ label, value, delta, icon, hint, accent = "neutral" }: KpiProps) {
  const accents = {
    brand: "bg-brand-600/10 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
    success: "bg-success/10 text-success-dark dark:text-success",
    danger: "bg-danger/10 text-danger-dark dark:text-danger",
    warning: "bg-warn/10 text-warn-dark dark:text-warn",
    gold: "bg-gold-soft text-gold dark:bg-gold/15",
    neutral: "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200",
  } as const;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-5 shadow-card transition hover:shadow-lg dark:border-ink-700/60 dark:bg-ink-900 dark:shadow-card-dark">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</div>
        {icon && <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accents[accent])}>{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50 sm:text-[1.6rem]">
          {value}
        </div>
        {delta && (
          <span
            className={cn(
              "text-xs font-medium",
              delta.positive ? "text-success-dark dark:text-success" : "text-danger-dark dark:text-danger"
            )}
          >
            {delta.positive ? "▲" : "▼"} {Math.abs(delta.value).toFixed(1)}%
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">{hint}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-ink-100 dark:bg-ink-800", className)} />;
}
