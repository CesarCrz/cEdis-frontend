"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, Search, SlidersHorizontal } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StockBadge } from "@/components/common/stock-badge"
import { AjusteModal } from "@/components/inventario/ajuste-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInventario, useSucursalInventario, type SucursalItem } from "@/hooks/use-inventario"
import { useClientes } from "@/hooks/use-clientes"
import { useCedisStore } from "@/store/cedis-store"
import { formatCurrency } from "@/lib/utils/format"
import type { InventarioItem } from "@/types/app.types"

function exportCsv(data: InventarioItem[]) {
  const headers = [
    "Nombre",
    "SKU",
    "Categoria",
    "Unidad",
    "Stock Actual",
    "Stock Minimo",
    "Costo Unit.",
    "Valor Total",
    "Estado",
  ]
  const rows = data.map((d) => [
    d.nombre,
    d.sku ?? "",
    d.categoria_nombre ?? "",
    d.unidad_simbolo,
    d.stock_actual,
    d.stock_minimo,
    d.costo_unitario,
    d.valor_total,
    d.semaforo,
  ])
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "inventario.csv"
  a.click()
  URL.revokeObjectURL(url)
}

const sucursalColumns: ColumnDef<SucursalItem>[] = [
  {
    accessorKey: "nombre",
    header: "Insumo",
    cell: ({ row }) => <span className="font-medium">{row.original.nombre}</span>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) =>
      row.original.sku ? (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
      ) : (
        <span className="text-muted-foreground/50 text-xs">—</span>
      ),
  },
  {
    id: "unidad",
    header: "Unidad",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.unidad?.simbolo ?? "—"}
      </span>
    ),
  },
  {
    id: "entregado",
    header: "Entregado por CEDIS",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-emerald-700 font-medium">
        {row.original.entregado} {row.original.unidad?.simbolo ?? ""}
      </span>
    ),
  },
  {
    id: "consumido",
    header: "Declarado consumido",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-orange-600">
        {row.original.consumido} {row.original.unidad?.simbolo ?? ""}
      </span>
    ),
  },
  {
    id: "stock_calculado",
    header: "En sucursal",
    cell: ({ row }) => (
      <span className={`font-mono text-sm font-semibold ${row.original.stock_calculado === 0 ? "text-destructive" : "text-foreground"}`}>
        {row.original.stock_calculado} {row.original.unidad?.simbolo ?? ""}
      </span>
    ),
  },
]

export default function InventarioPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [view, setView] = useState<"cedis" | "sucursales">("cedis")
  const [clienteId, setClienteId] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [search, setSearch] = useState("")
  const [sucursalSearch, setSucursalSearch] = useState("")
  const [sucursalCatFilter, setSucursalCatFilter] = useState("")
  const [ajusteOpen, setAjusteOpen] = useState(false)

  const { activeRole } = useCedisStore()
  const { data: res, isLoading: loadingCedis } = useInventario(cedisId)
  const { data: sucursalRes, isLoading: loadingSucursal } = useSucursalInventario(cedisId, clienteId)
  const { data: clientesRes } = useClientes(cedisId)

  const inventario: InventarioItem[] = res?.data ?? []
  const sucursalItems: SucursalItem[] = sucursalRes?.data ?? []
  const clientes = clientesRes?.data ?? []
  const isLoading = view === "cedis" ? loadingCedis : loadingSucursal

  const categorias = Array.from(
    new Set(inventario.map((i) => i.categoria_nombre).filter(Boolean))
  ) as string[]

  // Map insumo_id → categoria for sucursal filtering (sucursal items don't carry categoria)
  const insumoCategMap = new Map(
    inventario.map((i) => [i.insumo_id, i.categoria_nombre ?? ""])
  )

  const sucursalCategorias = Array.from(
    new Set(sucursalItems.map((i) => insumoCategMap.get(i.insumo_id) ?? "").filter(Boolean))
  ) as string[]

  const q = search.trim().toLowerCase()
  const filteredCedis = inventario.filter((i) => {
    if (categoriaFilter && i.categoria_nombre !== categoriaFilter) return false
    if (q && !i.nombre.toLowerCase().includes(q) && !(i.sku ?? "").toLowerCase().includes(q)) return false
    return true
  })

  const sq = sucursalSearch.trim().toLowerCase()
  const filteredSucursal = sucursalItems.filter((i) => {
    if (sucursalCatFilter && insumoCategMap.get(i.insumo_id) !== sucursalCatFilter) return false
    if (sq && !i.nombre.toLowerCase().includes(sq) && !(i.sku ?? "").toLowerCase().includes(sq)) return false
    return true
  })

  const columns: ColumnDef<InventarioItem>[] = [
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
      id: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <StockBadge
          stock={row.original.stock_actual}
          minimum={row.original.stock_minimo}
          unit={row.original.unidad_simbolo}
          showQuantity={false}
        />
      ),
    },
    {
      id: "valor",
      header: "Valor",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatCurrency(row.original.valor_total)}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Inventario"
        description="Stock actual por insumo"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => exportCsv(inventario)}
              disabled={inventario.length === 0}
            >
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Exportar CSV
            </Button>
            {activeRole !== "viewer" && (
              <Button
                variant="outline"
                onClick={() => setAjusteOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden />
                Ajuste manual
              </Button>
            )}
          </>
        }
      />

      <div className="mb-4 space-y-3">
        {/* View toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border bg-muted/40 p-1 gap-1">
            <button
              onClick={() => setView("cedis")}
              className={
                view === "cedis"
                  ? "px-3 py-1 rounded-md text-sm font-medium bg-background shadow-sm"
                  : "px-3 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
              }
            >
              CEDIS
            </button>
            <button
              onClick={() => setView("sucursales")}
              className={
                view === "sucursales"
                  ? "px-3 py-1 rounded-md text-sm font-medium bg-background shadow-sm"
                  : "px-3 py-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
              }
            >
              Sucursales
            </button>
          </div>

          {view === "sucursales" && (
            <Select
              value={clienteId || "__todos__"}
              onValueChange={(v) => { setClienteId(v === "__todos__" ? "" : v); setSucursalSearch(""); setSucursalCatFilter("") }}
            >
              <SelectTrigger className="w-[200px]" aria-label="Seleccionar sucursal">
                <SelectValue placeholder="Seleccionar sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__todos__">Seleccionar sucursal…</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* CEDIS filters */}
        {view === "cedis" && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Buscar insumo o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {categorias.length > 0 && (
              <Select
                value={categoriaFilter || "__todas__"}
                onValueChange={(v) => setCategoriaFilter(v === "__todas__" ? "" : v)}
              >
                <SelectTrigger className="w-[180px]" aria-label="Filtrar por categoría">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__todas__">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Sucursal filters (only when a sucursal is selected) */}
        {view === "sucursales" && clienteId && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Buscar insumo o SKU..."
                value={sucursalSearch}
                onChange={(e) => setSucursalSearch(e.target.value)}
              />
            </div>
            {sucursalCategorias.length > 0 && (
              <Select
                value={sucursalCatFilter || "__todas__"}
                onValueChange={(v) => setSucursalCatFilter(v === "__todas__" ? "" : v)}
              >
                <SelectTrigger className="w-[180px]" aria-label="Filtrar por categoría">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__todas__">Todas las categorías</SelectItem>
                  {sucursalCategorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {view === "cedis" ? (
        <DataTable columns={columns} data={filteredCedis} isLoading={isLoading} />
      ) : clienteId ? (
        <DataTable columns={sucursalColumns} data={filteredSucursal} isLoading={isLoading} />
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Selecciona una sucursal para ver su inventario
        </div>
      )}

      <AjusteModal
        open={ajusteOpen}
        onClose={() => setAjusteOpen(false)}
        cedisId={cedisId}
        inventario={inventario}
      />
    </div>
  )
}
