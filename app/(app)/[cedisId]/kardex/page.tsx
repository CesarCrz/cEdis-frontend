"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Printer, Search, X } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useKardex } from "@/hooks/use-kardex"
import { useClientes } from "@/hooks/use-clientes"
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import type { KardexEntry, KardexTipo } from "@/types/app.types"

const TIPO_CONFIG: Record<
  KardexTipo,
  { label: string; className: string; sign: "+" | "-" }
> = {
  entrada: {
    label: "Entrada",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    sign: "+",
  },
  salida_venta: {
    label: "Venta",
    className: "text-red-600 bg-red-50 border-red-200",
    sign: "-",
  },
  ajuste_manual: {
    label: "Ajuste",
    className: "text-blue-600 bg-blue-50 border-blue-200",
    sign: "+",
  },
  venta_declarada: {
    label: "Vta. Declarada",
    className: "text-orange-600 bg-orange-50 border-orange-200",
    sign: "-",
  },
  merma: {
    label: "Merma",
    className: "text-amber-600 bg-amber-50 border-amber-200",
    sign: "-",
  },
}

const TIPO_OPTIONS: { value: string; label: string }[] = [
  { value: "todos", label: "Todos los tipos" },
  { value: "entrada", label: "Entrada" },
  { value: "salida_venta", label: "Venta" },
  { value: "ajuste_manual", label: "Ajuste manual" },
  { value: "venta_declarada", label: "Venta declarada" },
  { value: "merma", label: "Merma" },
]

function getDefaultDesde() {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export default function KardexPage() {
  const { cedisId } = useParams<{ cedisId: string }>()

  const [search, setSearch] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [clienteFilter, setClienteFilter] = useState("")
  const [desde, setDesde] = useState(getDefaultDesde)
  const [hasta, setHasta] = useState("")

  const filters = {
    ...(tipoFilter && tipoFilter !== "todos"
      ? { tipo: tipoFilter as KardexTipo }
      : {}),
    ...(clienteFilter && clienteFilter !== "__todos__"
      ? { cliente_id: clienteFilter }
      : {}),
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  }

  const { data: res, isLoading } = useKardex(cedisId, filters)
  const { data: clientesRes } = useClientes(cedisId)

  const rawEntradas = res?.data ?? []
  const clientes = clientesRes?.data ?? []

  const entradas = search.trim()
    ? rawEntradas.filter((e) => {
        const q = search.toLowerCase()
        return (
          e.insumo?.nombre?.toLowerCase().includes(q) ||
          e.insumo?.sku?.toLowerCase().includes(q) ||
          e.notas?.toLowerCase().includes(q)
        )
      })
    : rawEntradas

  const hasFilters = !!search || !!tipoFilter || !!clienteFilter

  function clearFilters() {
    setSearch("")
    setTipoFilter("")
    setClienteFilter("")
    setDesde(getDefaultDesde())
    setHasta("")
  }

  const columns: ColumnDef<KardexEntry>[] = [
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDateTime(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "insumo",
      header: "Insumo",
      cell: ({ row }) =>
        row.original.insumo ? (
          <div>
            <p className="text-sm font-medium">{row.original.insumo.nombre}</p>
            {row.original.insumo.sku && (
              <p className="text-xs font-mono text-muted-foreground">
                {row.original.insumo.sku}
              </p>
            )}
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.insumo_id.slice(0, 8)}
          </span>
        ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const config = TIPO_CONFIG[row.original.tipo]
        return (
          <Badge
            variant="outline"
            className={cn("text-xs", config?.className)}
          >
            {config?.label ?? row.original.tipo}
          </Badge>
        )
      },
    },
    {
      id: "cantidad",
      header: "Cantidad",
      cell: ({ row }) => {
        const config = TIPO_CONFIG[row.original.tipo]
        const sign = config?.sign ?? "+"
        return (
          <span
            className={cn(
              "font-mono text-sm font-medium",
              sign === "+" ? "text-emerald-700" : "text-red-600"
            )}
          >
            {sign}
            {row.original.cantidad}{" "}
            {row.original.unidad?.simbolo ?? row.original.unidad_id}
          </span>
        )
      },
    },
    {
      id: "stock",
      header: "Stock antes → despues",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.stock_antes} → {row.original.stock_despues}
        </span>
      ),
    },
    {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) =>
        row.original.cliente ? (
          <span className="text-sm">{row.original.cliente.nombre}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      id: "usuario",
      header: "Usuario",
      cell: ({ row }) =>
        row.original.usuario ? (
          <span className="text-sm">{row.original.usuario.full_name}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
  ]

  return (
    <div className="p-6 print:p-0">
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">Kárdex — CEDIS</h1>
        <p className="text-sm text-muted-foreground">Generado el {formatDateTime(new Date().toISOString())}</p>
      </div>

      <div className="print:hidden">
        <PageHeader
          title="Kardex"
          description="Historial de movimientos de inventario"
          actions={
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" aria-hidden />
              Imprimir
            </Button>
          }
        />

        <div data-no-print className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden />
            <Input
              placeholder="Buscar insumo, SKU o nota…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[220px]"
              aria-label="Buscar en kardex"
            />
          </div>

          <Select
            value={tipoFilter || "todos"}
            onValueChange={(v) => setTipoFilter(v === "todos" ? "" : v)}
          >
            <SelectTrigger
              className="w-[160px]"
              aria-label="Filtrar por tipo"
            >
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {TIPO_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={clienteFilter || "__todos__"}
            onValueChange={(v) =>
              setClienteFilter(v === "__todos__" ? "" : v)
            }
          >
            <SelectTrigger
              className="w-[160px]"
              aria-label="Filtrar por cliente"
            >
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos los clientes</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-[140px]"
            aria-label="Fecha desde"
          />
          <Input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-[140px]"
            aria-label="Fecha hasta"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              aria-label="Limpiar filtros"
            >
              <X className="h-4 w-4 mr-1" aria-hidden />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <DataTable columns={columns} data={entradas} isLoading={isLoading} />
    </div>
  )
}
