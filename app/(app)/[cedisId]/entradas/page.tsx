"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PlusCircle, X } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { FolioCell } from "@/components/common/folio-cell"
import { EntradaModal } from "@/components/entradas/entrada-modal"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useEntradas } from "@/hooks/use-entradas"
import { useProveedores } from "@/hooks/use-proveedores"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { Entrada } from "@/types/app.types"

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
]

export default function EntradasPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const router = useRouter()

  const [statusFilter, setStatusFilter] = useState("")
  const [proveedorFilter, setProveedorFilter] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  const filters = {
    ...(statusFilter && statusFilter !== "todos" ? { status: statusFilter } : {}),
    ...(proveedorFilter && proveedorFilter !== "__todos__"
      ? { proveedor_id: proveedorFilter }
      : {}),
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  }

  const { data: res, isLoading } = useEntradas(cedisId, filters)
  const { data: proveedoresRes } = useProveedores(cedisId)

  const entradas = res?.data ?? []
  const proveedores = proveedoresRes?.data ?? []

  const hasFilters =
    !!statusFilter || !!proveedorFilter || !!desde || !!hasta

  function clearFilters() {
    setStatusFilter("")
    setProveedorFilter("")
    setDesde("")
    setHasta("")
  }

  const columns: ColumnDef<Entrada>[] = [
    {
      accessorKey: "folio",
      header: "Folio",
      cell: ({ row }) => <FolioCell folio={row.original.folio} />,
    },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm">{formatDate(row.original.created_at)}</span>
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
      id: "items",
      header: "Items",
      cell: ({ row }) => {
        const count =
          row.original.items?.length ??
          row.original.partidas?.length ??
          0
        return (
          <span className="font-mono text-sm text-muted-foreground">
            {count}
          </span>
        )
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => {
        const total =
          row.original.total_costo ?? row.original.total ?? 0
        return (
          <span className="font-mono text-sm">{formatCurrency(total)}</span>
        )
      },
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status ?? "draft"}
          tipo="entrada"
        />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/${cedisId}/entradas/${row.original.id}`)
          }
        >
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Entradas"
        description="Registro de ingresos de mercancia al CEDIS"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
            Nueva entrada
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Select
          value={statusFilter || "todos"}
          onValueChange={(v) => setStatusFilter(v === "todos" ? "" : v)}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={proveedorFilter || "__todos__"}
          onValueChange={(v) =>
            setProveedorFilter(v === "__todos__" ? "" : v)
          }
        >
          <SelectTrigger
            className="w-[160px]"
            aria-label="Filtrar por proveedor"
          >
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los proveedores</SelectItem>
            {proveedores.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
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

      <DataTable
        columns={columns}
        data={entradas}
        isLoading={isLoading}
      />

      <EntradaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cedisId={cedisId}
      />
    </div>
  )
}
