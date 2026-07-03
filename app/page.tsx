"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutGrid,
  Menu,
  X,
  Package2,
  Truck,
  BarChart3,
  FileText,
  Bell,
  Users,
  ScanLine,
  ClipboardList,
  LayoutDashboard,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// ─── Nav ─────────────────────────────────────────────────────────────────────

function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Precios", href: "#precios" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
          aria-label="cEdis - inicio"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <LayoutGrid className="h-3.5 w-3.5 text-primary-foreground" aria-hidden />
          </span>
          <span className="text-base">cEdis</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegacion principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex">
          <Button asChild size="sm">
            <Link href="/login">Iniciar sesion</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu de navegacion"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-64 pt-10">
          <nav className="flex flex-col gap-4" aria-label="Navegacion movil">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button asChild className="mt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Iniciar sesion
              </Link>
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-28">
      {/* Subtle teal glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Copy */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Controla tu CEDIS,
              <br />
              <span className="text-primary">distribuye con precision</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Plataforma completa para gestionar inventario, distribuir a
              sucursales y declarar ventas en tiempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">Comenzar gratis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como-funciona">Ver demo</a>
              </Button>
            </div>
          </div>

          {/* Mock KPI card */}
          <div aria-label="Vista previa de la plataforma cEdis" role="img">
            <div className="rounded-xl border border-border bg-card shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Dashboard — CEDIS Central
                </span>
                <span className="h-2 w-2 rounded-full bg-[var(--stock-ok)]" aria-label="Activo" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/60 p-3 text-center">
                  <p className="font-mono text-lg font-semibold text-foreground">247</p>
                  <p className="text-xs text-muted-foreground mt-0.5">insumos</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3 text-center">
                  <p className="font-mono text-lg font-semibold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground mt-0.5">tickets hoy</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3 text-center">
                  <p className="font-mono text-[15px] font-semibold text-foreground">$48,200</p>
                  <p className="text-xs text-muted-foreground mt-0.5">valor inv.</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Harina de trigo", semaforo: "ok", stock: "80 kg" },
                  { label: "Aceite vegetal", semaforo: "warn", stock: "12 L" },
                  { label: "Sal fina", semaforo: "critical", stock: "2 kg" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          item.semaforo === "ok" && "bg-[var(--stock-ok)]",
                          item.semaforo === "warn" && "bg-[var(--stock-warn)]",
                          item.semaforo === "critical" && "bg-[var(--stock-critical)]"
                        )}
                        aria-label={`Stock ${item.semaforo}`}
                      />
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{item.stock}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Package2,
    title: "Inventario en tiempo real",
    desc: "Semaforo visual: critico, bajo, alerta, ok. Stock actualizado con cada movimiento.",
  },
  {
    icon: Truck,
    title: "Distribucion masiva",
    desc: "Crea tickets para todas tus sucursales en un solo paso con ajustes individuales.",
  },
  {
    icon: BarChart3,
    title: "Ventas declaradas",
    desc: "Declara platillos vendidos por canal y calcula el consumo teorico de insumos.",
  },
  {
    icon: FileText,
    title: "Kardex completo",
    desc: "Trazabilidad total: entradas, salidas, mermas y ajustes con historial exportable.",
  },
  {
    icon: Bell,
    title: "Alertas de faltantes",
    desc: "Notificaciones automaticas cuando el stock baja del minimo configurado.",
  },
  {
    icon: Users,
    title: "Multi-sucursal",
    desc: "Un CEDIS, N sucursales. Cada cliente ve su inventario teorico calculado.",
  },
]

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground">
            Todo lo que necesitas para operar
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: ScanLine,
    title: "Registra insumos",
    desc: "Carga tu catalogo de insumos con SKU, unidad, stock minimo y costo. Importa desde CSV o crea uno a uno.",
    step: "01",
  },
  {
    icon: ClipboardList,
    title: "Crea tickets de distribucion",
    desc: "Selecciona sucursales, ajusta cantidades y emite el ticket. El stock se descuenta automaticamente.",
    step: "02",
  },
  {
    icon: LayoutDashboard,
    title: "Analiza en el dashboard",
    desc: "Visualiza KPIs, faltantes, consumo por receta y actividad reciente en un solo lugar.",
    step: "03",
  },
]

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground">
            Simple de usar, poderoso en datos
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.title} className="relative flex flex-col gap-4">
                {/* Connector line (desktop only) */}
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-[calc(100%_-_16px)] top-5 hidden sm:block h-px w-full bg-border"
                  />
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                    <Icon className="h-4.5 w-4.5 text-primary" aria-hidden />
                  </div>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    Paso {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/mes",
      highlight: false,
      features: [
        "Hasta 1 CEDIS",
        "100 insumos",
        "50 tickets al mes",
        "Soporte por email",
      ],
    },
    {
      name: "Pro",
      price: "$499 MXN",
      period: "/mes",
      highlight: true,
      features: [
        "CEDIS ilimitados",
        "Insumos ilimitados",
        "Tickets ilimitados",
        "Soporte prioritario",
        "Exportaciones (CSV, PDF)",
      ],
    },
  ]

  return (
    <section id="precios" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-foreground">
            Precios transparentes
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "rounded-xl border bg-card p-6 flex flex-col gap-6",
                plan.highlight
                  ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
                  : "border-border"
              )}
            >
              <div>
                {plan.highlight && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-2">
                    Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-semibold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <ul className="flex flex-col gap-2 flex-1" aria-label={`Beneficios del plan ${plan.name}`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlight ? "default" : "outline"}
                className="w-full"
              >
                <Link href="/login">Comenzar gratis</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section className="bg-primary py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-semibold text-primary-foreground mb-4">
          Empieza a controlar tu CEDIS hoy
        </h2>
        <p className="text-primary-foreground/80 mb-8 text-lg">
          Sin tarjeta de credito. Sin contratos. Cancela cuando quieras.
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/login">Crear cuenta gratis</Link>
        </Button>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/20">
            <LayoutGrid className="h-3 w-3 text-primary" aria-hidden />
          </span>
          <span>cEdis &copy; 2026</span>
        </div>
        <nav className="flex gap-4" aria-label="Pie de pagina">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacidad
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terminos
          </a>
        </nav>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  )
}
