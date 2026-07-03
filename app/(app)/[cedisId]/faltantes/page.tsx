"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, AlertTriangle, X } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFaltantes } from "@/hooks/use-faltantes"
import { useCategorias } from "@/hooks/use-categorias"
import { cn } from "@/lib/utils"
import type { Faltante } from "@/types/app.types"

const SEMAFORO_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  warn: {
    label: "Bajo",
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  low: {
    label: "Muy bajo",
    className: "text-orange-600 bg-orange-50 border-orange-200",
  },
  critical: {
    label: "Sin stock",
    className: "text-red-600 bg-red-50 border-red-200",
  },
}

const NIVEL_OPTIONS = [
  { value: "todos", label: "Todos los niveles" },
  { value: "warn", label: "Bajo" },
  { value: "low", label: "Muy bajo" },
  { value: "critical", label: "Sin stock" },
]

function exportCsv(data: Faltante[]) {
  const headers = [
    "Nombre",
    "SKU",
    "Categoria",
    "Unidad",
    "Stock Actual",
    "Stock Minimo",
    "Faltante",
    "Nivel",
    "Proveedor",
  ]
  const rows = data.map((d) => [
    d.nombre,
    d.sku ?? "",
    d.categoria_nombre ?? "",
    d.unidad_simbolo,
    d.stock_actual,
    d.stock_minimo,
    d.faltante,
    d.semaforo,
    d.proveedor_nombre ?? "",
  ])
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "faltantes.csv"
  a.click()
  URL.revokeObjectURL(url)
}

export default function FaltantesPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [nivelFilter, setNivelFilter] = useState("")

  const filters = {
    ...(categoriaFilter && categoriaFilter !== "__todos__"
      ? { categoria_id: categoriaFilter }
      : {}),
    ...(nivelFilter && nivelFilter !== "todos"
      ? { nivel: nivelFilter as Faltante["semaforo"] }
      : {}),
  }

  const { data: res, isLoading } = useFaltantes(cedisId, filters)
  const { data: categoriasRes } = useCategorias(cedisId)

  const faltantes = (res?.data ?? []).sort((a, b) => b.faltante - a.faltante)
  const categorias = categoriasRes?.data ?? []

  const hasFilters = !!categoriaFilter || !!nivelFilter

  function clearFilters() {
    setCategoriaFilter("")
    setNivelFilter("")
  }

  const columns: ColumnDef<Faltante>[] = [
    {
      accessorKey: "nombre",
      header: "Insumo",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
      cell: ({ row }) =>
        row.original.sku ? (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.sku}
          </span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      accessorKey: "categoria_nombre",
      header: "Categoria",
      cell: ({ row }) =>
        row.original.categoria_nombre ?? (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      id: "stock_actual",
      header: "Stock actual",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.stock_actual} {row.original.unidad_simbolo}
        </span>
      ),
    },
    {
      id: "stock_minimo",
      header: "Stock min.",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.stock_minimo} {row.original.unidad_simbolo}
        </span>
      ),
    },
    {
      accessorKey: "faltante",
      header: "Faltante",
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-red-600">
          {row.original.faltante} {row.original.unidad_simbolo}
        </span>
      ),
    },
    {
      accessorKey: "semaforo",
      header: "Nivel",
      cell: ({ row }) => {
        const config = SEMAFORO_CONFIG[row.original.semaforo]
        return (
          <Badge
            variant="outline"
            className={cn("text-xs", config?.className)}
          >
            {config?.label ?? row.original.semaforo}
          </Badge>
        )
      },
    },
    {
      accessorKey: "proveedor_nombre",
      header: "Proveedor",
      cell: ({ row }) =>
        row.original.proveedor_nombre ?? (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3 rounded-lg border bg-amber-50 border-amber-200 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" aria-hidden />
        <p className="text-sm font-medium text-amber-800">
          {isLoading
            ? "Cargando..."
            : `${faltantes.length} insumo(s) en alerta de stock`}
        </p>
      </div>

      <PageHeader
        title="Faltantes"
        description="Insumos con stock por debajo del minimo"
        actions={
          <Button
            variant="outline"
            onClick={() => exportCsv(faltantes)}
            disabled={faltantes.length === 0}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden />
            Exportar lista
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Select
          value={categoriaFilter || "__todos__"}
          onValueChange={(v) =>
            setCategoriaFilter(v === "__todos__" ? "" : v)
          }
        >
          <SelectTrigger
            className="w-[160px]"
            aria-label="Filtrar por categoria"
          >
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todas las categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={nivelFilter || "todos"}
          onValueChange={(v) => setNivelFilter(v === "todos" ? "" : v)}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filtrar por nivel">
            <SelectValue placeholder="Nivel" />
          </SelectTrigger>
          <SelectContent>
            {NIVEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

      <DataTable columns={columns} data={faltantes} isLoading={isLoading} />
    </div>
  )
}
