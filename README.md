# FinanzaPro

> Una app fintech premium de finanzas personales: registra hasta el gasto de un chicle y entiende tu dinero con claridad.

## ✨ Características

- **Dashboard ejecutivo** con KPIs, Health Score (0-100), insights inteligentes y gráficas premium.
- **Movimientos** con captura rápida (ingresos, gastos, transferencias) y filtros avanzados.
- **Presupuestos mensuales** por categoría con alertas al 70 %, 90 % y 100 %.
- **Deudas** con simulador de pago (avalancha / bola de nieve) y avance de liquidación.
- **Metas de ahorro** con barra de progreso, aportaciones y simulador de ahorro con tasa.
- **Cuentas** (efectivo, banco, crédito, débito, inversión, wallet, trading).
- **Reportes** visuales con comparativas, distribución por método de pago, histórico 12 meses y proyecciones.
- **Calendario financiero** con heatmap de gastos y vista detallada por día.
- **Configuración** completa: moneda, idioma, tema (claro/oscuro/sistema), modo privacidad, categorías, respaldo JSON, importación/exportación CSV.
- **Datos persistentes** en `localStorage` mediante Zustand + **sincronización opcional en la nube** (Firebase Auth + Firestore).
- **Detección automática** de gastos hormiga, suscripciones, gastos inusuales y deuda alta.
- **Mobile-first**: barra inferior con botón central de captura rápida y hoja “Más” con todas las secciones.
- **Navegación agrupada** en el escritorio: Día a día, Planificación, Patrimonio y Sistema — las 12 secciones accesibles.
- **Modo demo claro**: banner de datos de demostración con botón “Empezar de cero”.
- **Fechas correctas en cualquier zona horaria** (parseo local de fechas ISO, sin desfase de un día).

## 🛠 Stack técnico

- [Next.js 14](https://nextjs.org/) con App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand.docs.pmnd.rs/) (estado global + persist)
- [Recharts](https://recharts.org/) (gráficas)
- [Lucide React](https://lucide.dev/) (iconos)

## 🚀 Instalación

```bash
# 1. Instala dependencias
npm install

# 2. Levanta el servidor de desarrollo
npm run dev

# 3. Abre en el navegador
# http://localhost:3000
```

## 📂 Estructura

```
src/
├── app/                  # Páginas (App Router de Next.js)
│   ├── page.tsx          # Dashboard
│   ├── movimientos/
│   ├── ingresos/
│   ├── gastos/
│   ├── presupuestos/
│   ├── deudas/
│   ├── metas/
│   ├── cuentas/
│   ├── reportes/
│   ├── calendario/
│   └── configuracion/
├── components/
│   ├── ui/               # Card, Button, Input, Modal, primitives
│   ├── layout/           # Sidebar, Topbar, MobileNav, AppShell
│   ├── dashboard/        # HealthScore, InsightsPanel, Charts, RecentMovements
│   ├── forms/            # TransactionForm
│   └── transactions/     # TransactionsTable (reutilizable)
├── lib/
│   ├── calculations.ts   # Cálculos puros (KPIs, presupuestos, deudas, metas)
│   ├── financialAnalysis.ts  # Insights, alertas, Health Score
│   ├── formatters.ts     # Moneda, fecha, porcentaje
│   ├── validators.ts     # Validación de formularios
│   ├── csv.ts            # Import/Export CSV
│   └── utils.ts          # cn, uid, helpers
├── store/
│   └── financeStore.ts   # Zustand con persistencia
├── types/
│   └── finance.ts        # Tipos de dominio
└── data/
    └── mockData.ts       # Datos de demostración realistas
```

## 🎨 Diseño

- Paleta sobria: azul profundo (`brand`), verde financiero, gris grafito, dorado sutil.
- Tipografía Inter (system fallback).
- Cards con sombras suaves, bordes redondeados, animaciones sutiles.
- Modo oscuro premium con contraste cuidado.

## 🔐 Privacidad y respaldos

- Toda la información se guarda **localmente** en tu navegador.
- Activa el **modo privacidad** desde la barra superior (icono de ojo) para ocultar montos.
- Puedes descargar respaldos JSON desde Configuración.
- **Nube opcional**: crea `.env.local` a partir de `.env.local.example` con tus credenciales de Firebase e inicia sesión desde el menú de usuario (icono de persona en la barra superior) para sincronizar entre dispositivos.
- **Respaldo del código a GitHub**: ejecuta `backup.bat` (Windows) para hacer commit y push automáticos a `origin/main`. Cada push a `main` además despliega a Firebase Hosting vía GitHub Actions.

## 📜 Licencia

MIT — Úsala como base para construir tu propia herramienta financiera.
