"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { Download, SlidersHorizontal } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StockBadge } from "@/components/common/stock-badge"
import { AjusteModal } from "@/components/inventario/ajuste-modal"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInventario } from "@/hooks/use-inventario"
import { useClientes } from "@/hooks/use-clientes"
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

export default function InventarioPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [view, setView] = useState<"cedis" | "sucursales">("cedis")
  const [clienteId, setClienteId] = useState("")
  const [ajusteOpen, setAjusteOpen] = useState(false)

  const params = view === "sucursales" && clienteId ? { cliente_id: clienteId } : {}
  const { data: res, isLoading } = useInventario(cedisId, params)
  const { data: clientesRes } = useClientes(cedisId)

  const inventario = res?.data ?? []
  const clientes = clientesRes?.data ?? []

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
            <Button
              variant="outline"
              onClick={() => setAjusteOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" aria-hidden />
              Ajuste manual
            </Button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3">
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
            onValueChange={(v) => setClienteId(v === "__todos__" ? "" : v)}
          >
            <SelectTrigger
              className="w-[200px]"
              aria-label="Seleccionar sucursal"
            >
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__todos__">Todos</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <DataTable columns={columns} data={inventario} isLoading={isLoading} />

      <AjusteModal
        open={ajusteOpen}
        onClose={() => setAjusteOpen(false)}
        cedisId={cedisId}
        inventario={inventario}
      />
    </div>
  )
}
