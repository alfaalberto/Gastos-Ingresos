import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightAddon?: ReactNode;
}

const baseInput =
  "block w-full rounded-xl border bg-white text-ink-900 placeholder-ink-400 transition outline-none " +
  "h-11 px-3.5 text-sm shadow-sm " +
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 " +
  "dark:bg-ink-900 dark:text-ink-100 dark:placeholder-ink-500 ";

const baseBorder = "border-ink-200 dark:border-ink-700";
const errorBorder = "border-danger focus:border-danger focus:ring-danger/20";

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-ink-200">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

function FieldShell({
  label,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, leftIcon, rightAddon, className, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            baseInput,
            error ? errorBorder : baseBorder,
            leftIcon && "pl-10",
            rightAddon && "pr-12",
            className
          )}
          {...props}
        />
        {rightAddon && (
          <span className="absolute inset-y-0 right-3 flex items-center text-xs text-ink-500">
            {rightAddon}
          </span>
        )}
      </div>
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, options, className, children, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        className={cn(baseInput, "pr-8 appearance-none", error ? errorBorder : baseBorder, className)}
        {...props}
      >
        {options
          ? options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          : children}
      </select>
    </FieldShell>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, ...props },
  ref
) {
  return (
    <FieldShell label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        className={cn(
          baseInput,
          "h-auto min-h-[80px] py-2.5 resize-y",
          error ? errorBorder : baseBorder,
          className
        )}
        {...props}
      />
    </FieldShell>
  );
});

interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  hint?: string;
  size?: "sm" | "md";
}

export function Switch({ checked, onChange, label, hint, size = "md" }: SwitchProps) {
  const sizes = {
    sm: { w: "w-9", h: "h-5", knob: "h-4 w-4", trans: checked ? "translate-x-4" : "translate-x-0.5" },
    md: { w: "w-11", h: "h-6", knob: "h-5 w-5", trans: checked ? "translate-x-5" : "translate-x-0.5" },
  } as const;
  const s = sizes[size];
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      {label && (
        <span className="text-sm">
          <span className="block font-medium text-ink-800 dark:text-ink-100">{label}</span>
          {hint && <span className="block text-xs text-ink-500 dark:text-ink-400">{hint}</span>}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex items-center rounded-full transition-colors duration-200",
          s.w,
          s.h,
          checked ? "bg-brand-600" : "bg-ink-300 dark:bg-ink-700"
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full bg-white shadow transform transition-transform duration-200",
            s.knob,
            s.trans
          )}
        />
      </button>
    </label>
  );
}
