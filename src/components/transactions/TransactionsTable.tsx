"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Copy,
  Download,
  Pencil,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useFinanceStore } from "@/store/financeStore";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge, Empty, Segmented } from "@/components/ui/primitives";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { csvToTransactions, downloadFile, transactionsToCSV } from "@/lib/csv";
import { formatCurrency, formatDate, maskAmount } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types/finance";

type TypeFilter = "all" | TransactionType;

interface Props {
  defaultType?: TypeFilter;
  hideTypeFilter?: boolean;
  title?: string;
  subtitle?: string;
}

export function TransactionsTable({ defaultType = "all", hideTypeFilter, title = "Movimientos", subtitle }: Props) {
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const categories = useFinanceStore((s) => s.categories);
  const settings = useFinanceStore((s) => s.settings);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const duplicateTransaction = useFinanceStore((s) => s.duplicateTransaction);
  const bulkAddTransactions = useFinanceStore((s) => s.bulkAddTransactions);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(defaultType);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
      .filter((t) => (categoryFilter ? t.category === categoryFilter : true))
      .filter((t) => (accountFilter ? t.accountId === accountFilter : true))
      .filter((t) => (minAmount ? t.amount >= Number(minAmount) : true))
      .filter((t) => (maxAmount ? t.amount <= Number(maxAmount) : true))
      .filter((t) => (fromDate ? new Date(t.date) >= new Date(fromDate) : true))
      .filter((t) => (toDate ? new Date(t.date) <= new Date(toDate) : true))
      .filter((t) =>
        search.trim()
          ? [t.name, t.category, t.subcategory, t.notes, ...(t.tags || [])]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter, accountFilter, minAmount, maxAmount, fromDate, toDate, search]);

  const handleExport = () => {
    const csv = transactionsToCSV(filtered);
    const today = new Date().toISOString().slice(0, 10);
    downloadFile(`finanzapro-movimientos-${today}.csv`, csv);
  };

  const handleImport = () => {
    try {
      const txs = csvToTransactions(importText);
      if (txs.length === 0) {
        alert("No se encontraron movimientos válidos en el CSV.");
        return;
      }
      bulkAddTransactions(txs);
      setImportOpen(false);
      setImportText("");
    } catch (err) {
      console.warn(err);
      alert("Error al procesar el archivo.");
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result || ""));
    reader.readAsText(file, "utf-8");
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardSubtitle>
            {subtitle || `${filtered.length} ${filtered.length === 1 ? "movimiento" : "movimientos"} encontrados`}
          </CardSubtitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />} onClick={() => setImportOpen(true)}>
            Importar
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
            Exportar
          </Button>
        </div>
      </CardHeader>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!hideTypeFilter && (
            <Segmented<TypeFilter>
              value={typeFilter}
              onChange={setTypeFilter}
              size="sm"
              options={[
                { value: "all", label: "Todos" },
                { value: "income", label: "Ingresos" },
                { value: "expense", label: "Gastos" },
                { value: "transfer", label: "Transferencias" },
              ]}
            />
          )}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por nombre, categoría, etiqueta…"
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <details className="rounded-xl border border-ink-100 px-3 py-2 dark:border-ink-800">
          <summary className="cursor-pointer text-xs font-medium text-ink-600 dark:text-ink-300">Filtros avanzados</summary>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Select label="Categoría" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select label="Cuenta" value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)}>
              <option value="">Todas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
            <Input label="Monto mín." type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            <Input label="Monto máx." type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            <Input label="Desde" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <Input label="Hasta" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </details>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Empty
          title="Sin movimientos"
          description="Ajusta los filtros o crea uno nuevo usando el botón “+ Movimiento” arriba."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-500 dark:text-ink-400">
                <th className="px-2 py-2 font-medium">Movimiento</th>
                <th className="px-2 py-2 font-medium">Categoría</th>
                <th className="hidden px-2 py-2 font-medium md:table-cell">Cuenta</th>
                <th className="hidden px-2 py-2 font-medium sm:table-cell">Fecha</th>
                <th className="px-2 py-2 text-right font-medium">Monto</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const account = accounts.find((a) => a.id === t.accountId);
                const Icon = t.type === "income" ? ArrowUpRight : t.type === "expense" ? ArrowDownRight : ArrowLeftRight;
                const tone =
                  t.type === "income"
                    ? "bg-success/10 text-success-dark dark:text-success"
                    : t.type === "expense"
                    ? "bg-danger/10 text-danger-dark dark:text-danger"
                    : "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300";
                const amountStr = formatCurrency(t.amount, settings.currency, settings.locale);
                return (
                  <tr key={t.id} className="border-t border-ink-100 last:border-b-0 dark:border-ink-800">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="leading-tight">
                          <div className="font-medium text-ink-800 dark:text-ink-100">{t.name}</div>
                          <div className="text-[11px] text-ink-500 dark:text-ink-400">
                            {t.subcategory ?? t.paymentMethod ?? "—"}
                            {t.isRecurring && <span className="ml-1 text-brand-600 dark:text-brand-400">• recurrente</span>}
                            {t.isFixed && <span className="ml-1 text-warn-dark dark:text-warn">• fijo</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge variant="default">{t.category}</Badge>
                    </td>
                    <td className="hidden px-2 py-2.5 text-ink-600 dark:text-ink-300 md:table-cell">
                      {account?.name || "—"}
                    </td>
                    <td className="hidden px-2 py-2.5 text-ink-600 dark:text-ink-300 sm:table-cell">{formatDate(t.date)}</td>
                    <td className={cn(
                      "px-2 py-2.5 text-right font-semibold",
                      t.type === "income" ? "text-success-dark dark:text-success" :
                      t.type === "expense" ? "text-ink-900 dark:text-ink-50" :
                      "text-ink-700 dark:text-ink-200"
                    )}>
                      {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}
                      {maskAmount(amountStr, settings.privacyMode)}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                          aria-label="Duplicar"
                          title="Duplicar"
                          onClick={() => duplicateTransaction(t.id)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
                          aria-label="Editar"
                          title="Editar"
                          onClick={() => setEditing(t)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="rounded-lg p-1.5 text-ink-500 hover:bg-danger/10 hover:text-danger"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => setDeletingId(t.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Editar movimiento" size="lg">
        {editing && (
          <TransactionForm initial={editing} onClose={() => setEditing(null)} />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteTransaction(deletingId)}
        title="¿Eliminar movimiento?"
        description="Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar CSV"
        description="Pega contenido CSV o selecciona un archivo. Columnas: id, type, name, amount, date, category, subcategory, accountId, paymentMethod, isRecurring, isFixed, tags, notes."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!importText.trim()}>
              Importar
            </Button>
          </>
        }
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="mb-3 block w-full text-sm"
        />
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Pega el contenido CSV aquí…"
          rows={10}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-mono dark:border-ink-700 dark:bg-ink-900"
        />
      </Modal>
    </Card>
  );
}
