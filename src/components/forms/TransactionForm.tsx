"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Repeat as RepeatIcon } from "lucide-react";
import { useFinanceStore } from "@/store/financeStore";
import { Input, Select, Switch, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge, Segmented } from "@/components/ui/primitives";
import { validateTransaction, hasErrors } from "@/lib/validators";
import { todayISODate } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/data/mockData";
import type { Frequency, Transaction, TransactionType, ExpenseNature } from "@/types/finance";

interface Props {
  initial?: Partial<Transaction>;
  onClose?: () => void;
  defaultType?: TransactionType;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "once", label: "Único" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
  { value: "bimonthly", label: "Bimestral" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
  { value: "custom", label: "Personalizado" },
];

const NATURES: { value: ExpenseNature; label: string }[] = [
  { value: "necessary", label: "Necesario" },
  { value: "optional", label: "Opcional" },
  { value: "impulsive", label: "Impulsivo" },
  { value: "recurring", label: "Recurrente" },
  { value: "deductible", label: "Deducible" },
  { value: "critical", label: "Crítico" },
  { value: "avoidable", label: "Evitable" },
];

export function TransactionForm({ initial, onClose, defaultType = "expense" }: Props) {
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const isEditing = Boolean(initial?.id);
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType);
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState<string>(initial?.amount?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ?? todayISODate());
  const [category, setCategory] = useState(initial?.category ?? "");
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? "");
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(initial?.toAccountId ?? accounts[1]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? "Débito");
  const [source, setSource] = useState(initial?.source ?? "");
  const [isFixed, setIsFixed] = useState(initial?.isFixed ?? false);
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? "monthly");
  const [nature, setNature] = useState<ExpenseNature | "">(initial?.nature ?? "");
  const [tags, setTags] = useState<string>((initial?.tags ?? []).join(", "));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [errors, setErrors] = useState<ReturnType<typeof validateTransaction>>({});

  const filteredCategories = useMemo(
    () => categories.filter((c) => (type === "income" ? c.kind === "income" : c.kind === "expense")),
    [categories, type]
  );

  const selectedCategoryDef = filteredCategories.find((c) => c.name === category);
  const subcategories = selectedCategoryDef?.subcategories ?? [];

  const buildPayload = (): Partial<Transaction> => ({
    type,
    name: name.trim(),
    amount: Number(amount),
    date,
    category: type === "transfer" ? "Transferencia" : category,
    subcategory: subcategory || undefined,
    accountId,
    toAccountId: type === "transfer" ? toAccountId : undefined,
    paymentMethod: paymentMethod || undefined,
    source: type === "income" ? source || undefined : undefined,
    isFixed,
    isRecurring,
    frequency: isRecurring ? frequency : undefined,
    nature: type === "expense" && nature ? (nature as ExpenseNature) : undefined,
    tags: tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    notes: notes || undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    const errs = validateTransaction(payload);
    setErrors(errs);
    if (hasErrors(errs)) return;
    if (isEditing && initial?.id) {
      updateTransaction(initial.id, payload);
    } else {
      addTransaction(payload as Required<Transaction>);
    }
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Segmented
        value={type}
        onChange={(v) => setType(v as TransactionType)}
        options={[
          { value: "expense", label: "Gasto", icon: <ArrowDownRight className="h-4 w-4" /> },
          { value: "income", label: "Ingreso", icon: <ArrowUpRight className="h-4 w-4" /> },
          { value: "transfer", label: "Transferencia", icon: <RepeatIcon className="h-4 w-4" /> },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          placeholder={type === "expense" ? "Ej. Chicles, café, super..." : "Ej. Sueldo, proyecto, etc."}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          error={errors.name}
        />
        <Input
          label="Monto"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          error={errors.amount}
          leftIcon={<span className="text-ink-500">$</span>}
        />
        <Input
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          error={errors.date}
        />

        {type !== "transfer" && (
          <Select
            label="Categoría"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            error={errors.category}
          >
            <option value="">Selecciona…</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        )}

        {type !== "transfer" && subcategories.length > 0 && (
          <Select label="Subcategoría" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
            <option value="">—</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        )}

        <Select
          label={type === "transfer" ? "Cuenta origen" : "Cuenta"}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          error={errors.accountId}
        >
          <option value="">—</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>

        {type === "transfer" && (
          <Select
            label="Cuenta destino"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            required
            error={errors.toAccountId}
          >
            <option value="">—</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        )}

        {type !== "transfer" && (
          <Select label="Método de pago" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        )}

        {type === "income" && (
          <Input
            label="Fuente"
            placeholder="Ej. Empresa, cliente, plataforma"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        )}

        {type === "expense" && (
          <Select label="Naturaleza del gasto" value={nature} onChange={(e) => setNature(e.target.value as ExpenseNature | "")}>
            <option value="">—</option>
            {NATURES.map((n) => (
              <option key={n.value} value={n.value}>
                {n.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
          <Switch checked={isFixed} onChange={setIsFixed} label="Gasto fijo" hint="Renta, servicios, etc." size="sm" />
        </div>
        <div className="rounded-xl border border-ink-100 p-3 dark:border-ink-800">
          <Switch checked={isRecurring} onChange={setIsRecurring} label="Recurrente" hint="Se repite con frecuencia" size="sm" />
        </div>
        {isRecurring && (
          <Select label="Frecuencia" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        )}
      </div>

      <Input
        label="Etiquetas"
        placeholder="hormiga, urgente, trabajo (separadas por coma)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        hint="Útiles para análisis posterior"
      />

      <Textarea
        label="Notas"
        placeholder="Detalles adicionales"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />

      {type === "expense" && Number(amount) > 0 && Number(amount) <= 50 && (
        <div className="rounded-xl border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-warn-dark dark:text-warn">
          <Badge variant="warning" size="sm">Gasto hormiga</Badge>{" "}
          Aunque sea un chicle, este gasto cuenta. FinanzaPro lo registrará para analizar tus hábitos.
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit">{isEditing ? "Guardar cambios" : "Registrar"}</Button>
      </div>
    </form>
  );
}
