"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TransactionsTable } from "@/components/transactions/TransactionsTable";

export default function MovimientosPage() {
  return (
    <AppShell title="Movimientos" subtitle="Historial completo de tus ingresos, gastos y transferencias">
      <TransactionsTable />
    </AppShell>
  );
}
