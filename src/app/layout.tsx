import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FinanzaPro — Tu salud financiera, clara y premium",
  description:
    "Administra ingresos, gastos, presupuestos, deudas, metas y ahorro con análisis inteligente. Hasta un chicle cuenta.",
  applicationName: "FinanzaPro",
  authors: [{ name: "FinanzaPro" }],
  keywords: [
    "finanzas personales",
    "presupuesto",
    "ahorro",
    "deudas",
    "FinanzaPro",
    "control de gastos",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0d14" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
