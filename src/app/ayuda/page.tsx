"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardSubtitle } from "@/components/ui/Card";
import {
  BookOpen,
  Wallet,
  ArrowLeftRight,
  Settings,
  HelpCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  FileText,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  icon: any;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function HelpSection({ title, icon: Icon, isOpen, onToggle, children }: SectionProps) {
  return (
    <Card className="overflow-hidden border border-ink-100 transition duration-200 dark:border-ink-800">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-ink-50/50 dark:hover:bg-ink-900/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-ink-500" /> : <ChevronDown className="h-4 w-4 text-ink-500" />}
      </button>
      {isOpen && (
        <div className="border-t border-ink-50 bg-white p-5 text-sm leading-relaxed text-ink-600 dark:border-ink-900 dark:bg-ink-950 dark:text-ink-300">
          {children}
        </div>
      )}
    </Card>
  );
}

export default function AyudaPage() {
  const [openSection, setOpenSection] = useState<string | null>("conceptos");

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <AppShell title="Ayuda y Manual" subtitle="Aprende a usar FinanzaPro y entiende tu dinero">
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white p-6 dark:border-brand-900/30 dark:from-brand-950/20 dark:to-ink-950">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">Bienvenido al Centro de Ayuda</h2>
              <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                FinanzaPro es una herramienta de finanzas personales diseñada para registrar y comprender tus hábitos de dinero. Aquí tienes todo lo necesario para sacarle el máximo provecho de forma simple.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Conceptos Clave */}
          <HelpSection
            title="Conceptos Clave del Dashboard"
            icon={Wallet}
            isOpen={openSection === "conceptos"}
            onToggle={() => toggle("conceptos")}
          >
            <p className="mb-4">
              El Dashboard muestra los indicadores principales de tu salud financiera este mes. Esto es lo que significa cada valor:
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-400">
                  <Wallet className="h-4 w-4" /> Balance Total
                </div>
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  Es la suma neta de todo tu dinero disponible. Se calcula tomando los saldos actuales de tus cuentas (efectivo, débito, inversiones) menos las tarjetas de crédito o deudas.
                </p>
              </div>

              <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center gap-2 font-semibold text-success-dark dark:text-success">
                  <ArrowUpRight className="h-4 w-4" /> Ingresos del Mes
                </div>
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  La cantidad total de dinero que has recibido en el mes en curso (sueldos, freelance, rendimientos de inversión, etc.).
                </p>
              </div>

              <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center gap-2 font-semibold text-danger-dark dark:text-danger">
                  <ArrowDownRight className="h-4 w-4" /> Gastos del Mes
                </div>
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  La suma total que ha salido de tu billetera o cuentas bancarias este mes. Incluye gastos fijos, variables y pagos.
                </p>
              </div>

              <div className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center gap-2 font-semibold text-gold">
                  <ShieldCheck className="h-4 w-4" /> Presupuesto Disponible
                </div>
                <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400">
                  Indica cuánto dinero te queda por gastar dentro de los presupuestos límites que has creado para tus categorías. Te ayuda a saber si vas a llegar a fin de mes sin excederte.
                </p>
              </div>
            </div>
          </HelpSection>

          {/* Registro de Movimientos */}
          <HelpSection
            title="Cómo Registrar Movimientos (Paso a Paso)"
            icon={ArrowLeftRight}
            isOpen={openSection === "movimientos"}
            onToggle={() => toggle("movimientos")}
          >
            <p className="mb-3">
              Para registrar una nueva transacción, haz clic en el botón global <strong>+ Movimiento</strong> ubicado en la esquina superior derecha de la pantalla (o el botón flotante <strong>+</strong> en móviles).
            </p>
            <h4 className="font-semibold text-ink-950 dark:text-ink-100 mt-4 mb-2">Tipos de movimientos que puedes hacer:</h4>
            <ul className="flex flex-col gap-3.5 pl-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-danger/10 text-danger text-[10px] font-bold">G</span>
                <div>
                  <strong className="text-ink-800 dark:text-ink-200">Gasto:</strong> Salida de dinero. Al crearlo, puedes indicar su "Naturaleza" (ej: Opcional, Necesario, Impulsivo, Crítico) y si es un "Gasto Fijo" (como la renta) o "Recurrente" (mensualidades de streaming).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-success/10 text-success text-[10px] font-bold">I</span>
                <div>
                  <strong className="text-ink-800 dark:text-ink-200">Ingreso:</strong> Entrada de dinero. Puedes especificar la fuente (ej: nómina, freelance) y categorizarlo (ej: Salario, Rendimientos).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-brand-100 text-brand-700 text-[10px] font-bold">T</span>
                <div>
                  <strong className="text-ink-800 dark:text-ink-200">Transferencia:</strong> Movimiento de dinero entre tus propias cuentas (ej: pasar de Nómina a Efectivo o Ahorro). No afecta tus ingresos ni gastos netos, solo actualiza los balances de cada cuenta.
                </div>
              </li>
            </ul>

            <div className="mt-5 rounded-xl border border-warn/30 bg-warn/5 p-4 text-xs text-ink-700 dark:text-ink-300">
              <div className="flex items-center gap-1.5 font-semibold text-warn-dark dark:text-warn mb-1">
                <Sparkles className="h-4 w-4 text-gold shrink-0" />
                <span>¿Qué es un Gasto Hormiga?</span>
              </div>
              Un gasto menor a <strong>$50</strong> es considerado un "Gasto Hormiga" de forma automática (ej. chicles, café, propinas). FinanzaPro los rastrea de manera especial para alertarte sobre cómo estos pequeños montos se acumulan al final del mes.
            </div>
          </HelpSection>

          {/* Presupuestos */}
          <HelpSection
            title="Presupuestos: Controla tu Limite"
            icon={TrendingUp}
            isOpen={openSection === "presupuestos"}
            onToggle={() => toggle("presupuestos")}
          >
            <p className="mb-4">
              Un presupuesto es una meta de gasto máximo por categoría. Te ayuda a distribuir tus ingresos y evitar sorpresas desagradables.
            </p>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-ink-950 dark:text-ink-100">Estados de un Presupuesto:</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="rounded-xl bg-success/5 border border-success/20 p-3 text-center">
                  <span className="inline-block rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success-dark dark:text-success">En rango</span>
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Has gastado menos del 70% del límite.</p>
                </div>
                <div className="rounded-xl bg-gold/5 border border-gold/25 p-3 text-center">
                  <span className="inline-block rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">Atención</span>
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Superaste el 70% asignado.</p>
                </div>
                <div className="rounded-xl bg-warn/5 border border-warn/20 p-3 text-center">
                  <span className="inline-block rounded-full bg-warn/20 px-2 py-0.5 text-[10px] font-semibold text-warn-dark dark:text-warn">Cerca de límite</span>
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Superaste el 90%. ¡Hora de frenar!</p>
                </div>
                <div className="rounded-xl bg-danger/5 border border-danger/20 p-3 text-center">
                  <span className="inline-block rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-semibold text-danger-dark dark:text-danger">Excedido</span>
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">Te pasaste del límite mensual.</p>
                </div>
              </div>
            </div>
          </HelpSection>

          {/* Configuración y Privacidad */}
          <HelpSection
            title="Seguridad, Datos y Privacidad"
            icon={Settings}
            isOpen={openSection === "privacidad"}
            onToggle={() => toggle("privacidad")}
          >
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-success-dark dark:text-success" /> Privacidad de Datos
                </h4>
                <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">
                  Por defecto, FinanzaPro es una aplicación orientada a la privacidad. Todos tus datos financieros se almacenan <strong>localmente</strong> en tu navegador (LocalStorage). Nadie más puede ver tus montos. Si configuras la sincronización con Firebase (en .env), estos se cifran y guardan bajo tu cuenta de usuario.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <ShieldAlert className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" /> Modo Privacidad (Modo Discreto)
                </h4>
                <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">
                  Si estás en un café o en el transporte público y no quieres que nadie espíe tus saldos, activa el **Modo Privacidad** haciendo clic en el icono del ojo tachado (<kbd className="rounded bg-ink-100 px-1 py-0.5 text-[10px] dark:bg-ink-800">EyeOff</kbd>) en la barra superior o en Configuración. Ocultará inmediatamente todos los montos con asteriscos (`$***`).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-ink-600 dark:text-ink-300" /> Respaldos e Importación
                </h4>
                <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">
                  En la pestaña de **Configuración**, puedes descargar un archivo de respaldo en formato JSON para transferir tus datos a otro dispositivo, o bien exportar tus transacciones a un archivo CSV para abrir en Excel.
                </p>
              </div>
            </div>
          </HelpSection>

          {/* Ejemplos Prácticos */}
          <HelpSection
            title="Ejemplos Prácticos de Finanzas Diarias"
            icon={Sparkles}
            isOpen={openSection === "ejemplos"}
            onToggle={() => toggle("ejemplos")}
          >
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4 dark:border-ink-800 dark:bg-ink-900/10">
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-success shrink-0" /> Ejemplo 1: Registrar el salario
                </h4>
                <ol className="mt-2 list-decimal pl-4 text-xs text-ink-500 dark:text-ink-400 flex flex-col gap-1">
                  <li>Haz clic en **+ Movimiento**.</li>
                  <li>Selecciona la pestaña **Ingreso**.</li>
                  <li>Escribe el nombre: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Sueldo Quincena</kbd>.</li>
                  <li>Ingresa el monto (ej: <kbd className="rounded bg-white px-1 dark:bg-ink-800">12000</kbd>).</li>
                  <li>En **Categoría**, selecciona <kbd className="rounded bg-white px-1 dark:bg-ink-800">Salario</kbd> (o Trabajo).</li>
                  <li>Elige la cuenta receptora (ej: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Nómina</kbd>) y haz clic en **Registrar**.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4 dark:border-ink-800 dark:bg-ink-900/10">
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-danger shrink-0" /> Ejemplo 2: El chicle de camino a casa
                </h4>
                <ol className="mt-2 list-decimal pl-4 text-xs text-ink-500 dark:text-ink-400 flex flex-col gap-1">
                  <li>Haz clic en **+ Movimiento**.</li>
                  <li>Selecciona la pestaña **Gasto**.</li>
                  <li>Nombre: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Chicles Oxxo</kbd>.</li>
                  <li>Monto: <kbd className="rounded bg-white px-1 dark:bg-ink-800">25</kbd>.</li>
                  <li>Categoría: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Otros</kbd> o <kbd className="rounded bg-white px-1 dark:bg-ink-800">Comida</kbd>.</li>
                  <li>Selecciona la cuenta (ej: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Efectivo</kbd>).</li>
                  <li>Haz clic en **Registrar**. Verás la alerta de *Gasto Hormiga* debido a que el monto es menor de $50.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50/30 p-4 dark:border-ink-800 dark:bg-ink-900/10">
                <h4 className="font-semibold text-ink-950 dark:text-ink-100 flex items-center gap-1.5">
                  <Play className="h-3 w-3 text-brand-600 shrink-0" /> Ejemplo 3: Crear presupuesto de Comida
                </h4>
                <ol className="mt-2 list-decimal pl-4 text-xs text-ink-500 dark:text-ink-400 flex flex-col gap-1">
                  <li>Ve a la pestaña de **Presupuestos** en la barra lateral.</li>
                  <li>Haz clic en **Nuevo presupuesto**.</li>
                  <li>Selecciona la categoría: <kbd className="rounded bg-white px-1 dark:bg-ink-800">Alimentos / Comida</kbd>.</li>
                  <li>Ingresa el límite (ej: <kbd className="rounded bg-white px-1 dark:bg-ink-800">4000</kbd>).</li>
                  <li>Haz clic en **Guardar**. La app comenzará a monitorear cada gasto de esa categoría y te avisará si te acercas al límite de $4000.</li>
                </ol>
              </div>
            </div>
          </HelpSection>
        </div>
      </div>
    </AppShell>
  );
}
