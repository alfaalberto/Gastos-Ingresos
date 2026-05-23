import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  padded?: boolean;
}

export function Card({ children, className, padded = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white shadow-card transition",
        "dark:border-ink-700/60 dark:bg-ink-900 dark:shadow-card-dark",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-sm font-semibold text-ink-700 dark:text-ink-100", className)}>{children}</h3>
  );
}

export function CardSubtitle({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs text-ink-500 dark:text-ink-400", className)}>{children}</p>;
}
