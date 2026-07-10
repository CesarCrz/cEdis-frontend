"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { KbdShortcut } from "@/components/common/kbd-shortcut"
import {
  MoreHorizontal,
  Upload,
  Download,
  PlusCircle,
  Search,
  X,
  Package,
  History,
  PowerOff,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StockBadge } from "@/components/common/stock-badge"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { InsumoModal } from "@/components/insumos/insumo-modal"
import { CsvImportSheet } from "@/components/insumos/csv-import-sheet"
import { PriceHistorySheet } from "@/components/insumos/price-history-sheet"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useInsumos, useUpdateInsumo } from "@/hooks/use-insumos"
import { useCategorias } from "@/hooks/use-categorias"
import { useProveedores } from "@/hooks/use-proveedores"
import { formatCurrency, formatQuantity } from "@/lib/utils/format"
import type { Insumo } from "@/types/app.types"

const PAGE_SIZE = 50

function exportInsumosCsv(insumos: Insumo[]) {
  const headers = ["nombre", "sku", "categoria", "unidad", "costo_unitario", "stock_actual", "stock_minimo", "proveedor"]
  const rows = insumos.map((ins) => [
    ins.nombre,
    ins.sku ?? "",
    ins.categoria?.nombre ?? "",
    ins.unidad?.simbolo ?? ins.unidad_medida ?? "",
    ins.costo_unitario ?? "",
    ins.stock_actual,
    ins.stock_minimo,
    ins.proveedor?.nombre ?? "",
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `insumos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const ALERTA_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "ok", label: "En stock" },
  { value: "warn", label: "Bajo" },
  { value: "low", label: "Muy bajo" },
  { value: "critical", label: "Sin stock" },
]

export default function InsumosPage() {
  const params = useParams()
  const cedisId = params.cedisId as string

  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [proveedorFilter, setProveedorFilter] = useState("")
  const [alertaFilter, setAlertaFilter] = useState("")
  const [pageIndex, setPageIndex] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  useKeyboardShortcut("n", useCallback(() => { setEditingInsumo(undefined); setModalOpen(true) }, []), { enabled: !modalOpen })
  const [editingInsumo, setEditingInsumo] = useState<Insumo | undefined>()
  const [csvSheetOpen, setCsvSheetOpen] = useState(false)
  const [historySheetOpen, setHistorySheetOpen] = useState(false)
  const [historyInsumo, setHistoryInsumo] = useState<{
    id: string
    nombre: string
  } | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState<Insumo | null>(
    null
  )

  // Fetch all at once — filter client-side for instant search
  const { data: res, isLoading } = useInsumos(cedisId, { pageSize: 1000 })
  const { data: categoriasRes } = useCategorias(cedisId)
  const { data: proveedoresRes } = useProveedores(cedisId)
  const updateInsumo = useUpdateInsumo(cedisId)

  const allInsumos = res?.data ?? []
  const categorias = categoriasRes?.data ?? []
  const proveedores = proveedoresRes?.data ?? []

  const insumos = allInsumos.filter((ins) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !ins.nombre.toLowerCase().includes(q) &&
        !(ins.sku ?? "").toLowerCase().includes(q)
      )
        return false
    }
    if (categoriaFilter && categoriaFilter !== "__todos__") {
      if (ins.categoria_id !== categoriaFilter) return false
    }
    if (proveedorFilter && proveedorFilter !== "__todos__") {
      if (ins.proveedor_id !== proveedorFilter) return false
    }
    if (alertaFilter && alertaFilter !== "todos") {
      const stock = Number(ins.stock_actual)
      const min = Number(ins.stock_minimo)
      switch (alertaFilter) {
        case "ok":       if (!(stock > min)) return false; break
        case "warn":     if (!(stock <= min && stock > min * 0.5 && stock > 0)) return false; break
        case "low":      if (!(stock <= min * 0.5 && stock > 0)) return false; break
        case "critical": if (!(stock === 0)) return false; break
      }
    }
    return true
  })

  const hasFilters = !!search || !!categoriaFilter || !!proveedorFilter || !!alertaFilter

  function clearFilters() {
    setSearch("")
    setCategoriaFilter("")
    setProveedorFilter("")
    setAlertaFilter("")
    setPageIndex(0)
  }

  const pageCount = Math.ceil(insumos.length / PAGE_SIZE)
  const paginatedInsumos = insumos.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)

  const handleEdit = useCallback((insumo: Insumo) => {
    setEditingInsumo(insumo)
    setModalOpen(true)
  }, [])

  const handleDeactivate = useCallback(async () => {
    if (!confirmDeactivate) return
    const res = await updateInsumo.mutateAsync({
      id: confirmDeactivate.id,
      data: { activo: false },
    })
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`${confirmDeactivate.nombre} desactivado`)
    setConfirmDeactivate(null)
  }, [confirmDeactivate, updateInsumo])

  const columns: ColumnDef<Insumo>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.nombre}</span>
          {row.original.sku && (
            <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">{row.original.sku}</p>
          )}
        </div>
      ),
    },
    {
      id: "categoria",
      header: "Categoria",
      cell: ({ row }) =>
        row.original.categoria ? (
          <Badge variant="outline" className="text-xs font-normal">
            {row.original.categoria.nombre}
          </Badge>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      id: "unidad",
      header: "Unidad",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.unidad?.simbolo ?? row.original.unidad_medida ?? "—"}
        </span>
      ),
    },
    {
      id: "costo",
      header: "Costo",
      cell: ({ row }) => {
        const costo =
          row.original.costo_unitario ?? row.original.precio_unitario
        return costo != null ? (
          <span className="font-mono text-sm">{formatCurrency(costo)}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const simbolo = row.original.unidad?.simbolo ?? row.original.unidad_medida
        return (
          <div>
            <span className="font-mono text-sm">{formatQuantity(row.original.stock_actual, simbolo)}</span>
            <p className="font-mono text-xs text-muted-foreground/60 mt-0.5">mín {formatQuantity(row.original.stock_minimo, simbolo)}</p>
          </div>
        )
      },
    },
    {
      id: "alerta",
      header: "Alerta",
      cell: ({ row }) => (
        <StockBadge
          stock={row.original.stock_actual}
          minimum={row.original.stock_minimo}
          unit={row.original.unidad?.simbolo ?? row.original.unidad_medida}
          showQuantity={false}
        />
      ),
    },
    {
      id: "proveedor",
      header: "Proveedor",
      cell: ({ row }) =>
        row.original.proveedor ? (
          <span className="text-sm">{row.original.proveedor.nombre}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label={`Acciones para ${row.original.nombre}`}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleEdit(row.original)}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setHistoryInsumo({
                  id: row.original.id,
                  nombre: row.original.nombre,
                })
                setHistorySheetOpen(true)
              }}
            >
              <History className="h-4 w-4 mr-2" aria-hidden />
              Ver historial de precios
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setConfirmDeactivate(row.original)}
            >
              <PowerOff className="h-4 w-4 mr-2" aria-hidden />
              Desactivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Insumos"
        description="Gestiona los materiales y materias primas del CEDIS"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => exportInsumosCsv(insumos)}
              disabled={insumos.length === 0}
            >
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => setCsvSheetOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" aria-hidden />
              Importar CSV
            </Button>
            <Button
              onClick={() => {
                setEditingInsumo(undefined)
                setModalOpen(true)
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
              Nuevo insumo<KbdShortcut keys="n" />
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="insumos-search"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageIndex(0) }}
            className="pl-8"
            aria-label="Buscar insumos"
          />
        </div>

        <Select
          value={categoriaFilter || "__todos__"}
          onValueChange={(v) => { setCategoriaFilter(v === "__todos__" ? "" : v); setPageIndex(0) }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filtrar por categoria">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todas las categorias</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={proveedorFilter || "__todos__"}
          onValueChange={(v) => { setProveedorFilter(v === "__todos__" ? "" : v); setPageIndex(0) }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filtrar por proveedor">
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los proveedores</SelectItem>
            {proveedores.map((prov) => (
              <SelectItem key={prov.id} value={prov.id}>
                {prov.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={alertaFilter || "todos"}
          onValueChange={(v) => { setAlertaFilter(v === "todos" ? "" : v); setPageIndex(0) }}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filtrar por nivel de alerta">
            <SelectValue placeholder="Alerta" />
          </SelectTrigger>
          <SelectContent>
            {ALERTA_OPTIONS.map((opt) => (
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

      {/* Table */}
      {!isLoading && insumos.length === 0 && !hasFilters ? (
        <EmptyState
          icon={Package}
          title="Sin insumos"
          description="Agrega tu primer insumo para empezar a gestionar el inventario."
          action={{
            label: "Nuevo insumo",
            onClick: () => {
              setEditingInsumo(undefined)
              setModalOpen(true)
            },
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedInsumos}
          isLoading={isLoading}
          pagination={pageCount > 1 ? { pageIndex, pageSize: PAGE_SIZE } : undefined}
          pageCount={pageCount}
          onPaginationChange={pageCount > 1 ? (p) => setPageIndex(p.pageIndex) : undefined}
        />
      )}

      {/* Modals / Sheets */}
      <InsumoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingInsumo(undefined)
        }}
        cedisId={cedisId}
        insumo={editingInsumo}
      />

      <CsvImportSheet
        open={csvSheetOpen}
        onClose={() => setCsvSheetOpen(false)}
        cedisId={cedisId}
      />

      {historyInsumo && (
        <PriceHistorySheet
          open={historySheetOpen}
          onClose={() => {
            setHistorySheetOpen(false)
            setHistoryInsumo(null)
          }}
          cedisId={cedisId}
          insumoId={historyInsumo.id}
          insumoNombre={historyInsumo.nombre}
        />
      )}

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Desactivar insumo"
        description={`¿Estas seguro de que deseas desactivar "${confirmDeactivate?.nombre}"? El insumo no sera eliminado y podra reactivarse.`}
        confirmLabel="Desactivar"
        loading={updateInsumo.isPending}
      />
    </div>
  )
}
