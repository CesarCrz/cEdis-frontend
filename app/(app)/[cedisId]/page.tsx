"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Package,
  ShoppingCart,
  PackagePlus,
  AlertTriangle,
  TrendingUp,
  Activity,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

import { useDashboard } from "@/hooks/use-dashboard"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Faltante } from "@/types/app.types"

const FALTANTE_COLORS: Record<string, string> = {
  warn: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
}

const FALTANTE_LABELS: Record<string, string> = {
  warn: "Bajo",
  low: "Muy bajo",
  critical: "Sin stock",
}

const DONUT_COLORS = ["#0d9488", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"]

const PERIODOS = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
] as const

type Periodo = "7d" | "30d" | "90d"

export default function DashboardPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [periodo, setPeriodo] = useState<Periodo>("30d")
  const { data: res, isLoading } = useDashboard(cedisId, periodo)
  const dash = res?.data

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visión general del CEDIS
          </p>
        </div>

        {/* Period selector — SnowUI style dropdown button */}
        <div className="relative">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 shadow-sm">
            {PERIODOS.map((p, i) => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[13px] font-medium transition-all",
                  periodo === p.value
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  i !== 0 && ""
                )}
                aria-pressed={periodo === p.value}
              >
                {p.label}
              </button>
            ))}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" aria-hidden />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Insumos"
          value={dash?.kpis.total_insumos}
          icon={Package}
          href={`/${cedisId}/insumos`}
          isLoading={isLoading}
          color="blue"
        />
        <KpiCard
          title="Valor Inventario"
          value={
            dash?.kpis.valor_inventario != null
              ? formatCurrency(dash.kpis.valor_inventario)
              : undefined
          }
          icon={TrendingUp}
          href={`/${cedisId}/inventario`}
          isLoading={isLoading}
          color="green"
        />
        <KpiCard
          title="Tickets Pendientes"
          value={dash?.kpis.tickets_pendientes}
          icon={ShoppingCart}
          href={`/${cedisId}/ventas`}
          isLoading={isLoading}
          color={(dash?.kpis.tickets_pendientes ?? 0) > 0 ? "amber" : "default"}
        />
        <KpiCard
          title="Entradas (periodo)"
          value={dash?.kpis.entradas_periodo}
          icon={PackagePlus}
          href={`/${cedisId}/entradas`}
          isLoading={isLoading}
          color="indigo"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ventas bar chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-foreground">
              Ventas por día
            </p>
            <Link
              href={`/${cedisId}/ventas`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Ver todas
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          {isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : dash?.ventas_por_dia && dash.ventas_por_dia.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={dash.ventas_por_dia} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(v) => {
                    try { return formatDate(v) } catch { return v }
                  }}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(v: unknown) => [formatCurrency(Number(v)), "Total"]}
                  labelFormatter={(l) => {
                    try { return formatDate(l) } catch { return l }
                  }}
                  contentStyle={{
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    background: "var(--card)",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
              Sin datos de ventas en el periodo
            </div>
          )}
        </div>

        {/* Faltantes */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden />
              Faltantes
            </p>
            <Link
              href={`/${cedisId}/faltantes`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : dash?.faltantes_preview && dash.faltantes_preview.length > 0 ? (
            <ul className="space-y-1.5">
              {dash.faltantes_preview.slice(0, 6).map((f: Faltante) => (
                <li
                  key={f.insumo_id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-muted/40 text-sm"
                >
                  <span className="truncate font-medium text-foreground text-[13px]">
                    {f.nombre}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] shrink-0 px-1.5", FALTANTE_COLORS[f.semaforo])}
                  >
                    {FALTANTE_LABELS[f.semaforo]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-green-600" aria-hidden />
              </div>
              <p className="text-sm text-muted-foreground">Stock OK</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom charts: top insumos + ventas por canal */}
      {((dash?.top_insumos?.length ?? 0) > 0 || (dash?.ventas_por_canal?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top 10 insumos más vendidos */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[14px] font-semibold text-foreground mb-5">
              Top insumos distribuidos
            </p>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : dash?.top_insumos && dash.top_insumos.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={dash.top_insumos.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 0, right: 24, top: 0, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
                  />
                  <Tooltip
                    formatter={(v: unknown) => [String(v), "Unidades"]}
                    contentStyle={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      background: "var(--card)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Sin datos en el periodo
              </div>
            )}
          </div>

          {/* Ventas por canal (donut) */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[14px] font-semibold text-foreground mb-5">
              Distribución por canal
            </p>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : dash?.ventas_por_canal && dash.ventas_por_canal.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dash.ventas_por_canal}
                    dataKey="cantidad"
                    nameKey="canal"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {dash.ventas_por_canal.map((_, i) => (
                      <Cell
                        key={i}
                        fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: unknown) => [String(v), "Unidades"]}
                    contentStyle={{
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      background: "var(--card)",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    formatter={(value: string) => (
                      <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Sin datos de ventas declaradas
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-muted-foreground" aria-hidden />
          Actividad reciente
        </p>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : dash?.actividad_reciente && dash.actividad_reciente.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {dash.actividad_reciente.slice(0, 8).map((a) => (
              <li key={a.id} className="py-2.5 flex items-center gap-3 text-sm">
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono font-medium text-muted-foreground">
                  {a.tipo}
                </span>
                <span className="flex-1 truncate text-foreground/80 text-[13px]">
                  {a.usuario_nombre}
                </span>
                <span className="text-[11px] text-muted-foreground/60 shrink-0">
                  {formatRelativeTime(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sin actividad reciente
          </p>
        )}
      </div>
    </div>
  )
}

const KPI_COLORS = {
  default: "bg-card",
  blue: "bg-[#eaf4fe]",
  green: "bg-[#eafaf0]",
  amber: "bg-[#fff8e6]",
  indigo: "bg-[#eeeeff]",
} as const

const KPI_ICON_COLORS = {
  default: "text-muted-foreground bg-muted",
  blue: "text-blue-600 bg-blue-100",
  green: "text-emerald-600 bg-emerald-100",
  amber: "text-amber-600 bg-amber-100",
  indigo: "text-indigo-600 bg-indigo-100",
} as const

interface KpiCardProps {
  title: string
  value?: number | string
  icon: React.ElementType
  href: string
  isLoading?: boolean
  color?: keyof typeof KPI_COLORS
}

function KpiCard({
  title,
  value,
  icon: Icon,
  href,
  isLoading,
  color = "default",
}: KpiCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-xl border border-border/60 p-5 block transition-all hover:shadow-md hover:border-border",
        KPI_COLORS[color]
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-[13px] font-medium text-foreground/70 leading-tight">
          {title}
        </p>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", KPI_ICON_COLORS[color])}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-[26px] font-bold tracking-tight text-foreground font-mono-data">
          {value ?? "—"}
        </p>
      )}
    </Link>
  )
}
