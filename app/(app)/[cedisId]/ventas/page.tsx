"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PlusCircle, Users, X } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { StatusBadge } from "@/components/common/status-badge"
import { FolioCell } from "@/components/common/folio-cell"
import { TicketModal } from "@/components/ventas/ticket-modal"
import { BatchModal } from "@/components/ventas/batch-modal"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useVentas } from "@/hooks/use-ventas"
import { useClientes } from "@/hooks/use-clientes"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { Ticket } from "@/types/app.types"

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "confirmed", label: "Confirmado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
]

export default function VentasPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const router = useRouter()

  const [statusFilter, setStatusFilter] = useState("")
  const [clienteFilter, setClienteFilter] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [ticketModalOpen, setTicketModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)

  const filters = {
    ...(statusFilter && statusFilter !== "todos" ? { status: statusFilter } : {}),
    ...(clienteFilter && clienteFilter !== "__todos__"
      ? { cliente_id: clienteFilter }
      : {}),
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  }

  const { data: res, isLoading } = useVentas(cedisId, filters)
  const { data: clientesRes } = useClientes(cedisId)

  const tickets = res?.data ?? []
  const clientes = clientesRes?.data ?? []

  const hasFilters = !!statusFilter || !!clienteFilter || !!desde || !!hasta

  function clearFilters() {
    setStatusFilter("")
    setClienteFilter("")
    setDesde("")
    setHasta("")
  }

  const columns: ColumnDef<Ticket>[] = [
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
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatCurrency(row.original.total ?? 0)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} tipo="ticket" />
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${cedisId}/ventas/${row.original.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Ventas"
        description="Tickets de venta y distribucion"
        actions={
          <>
            <Button variant="outline" onClick={() => setBatchModalOpen(true)}>
              <Users className="h-4 w-4 mr-2" aria-hidden />
              Distribucion masiva
            </Button>
            <Button onClick={() => setTicketModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
              Nuevo ticket
            </Button>
          </>
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
          value={clienteFilter || "__todos__"}
          onValueChange={(v) =>
            setClienteFilter(v === "__todos__" ? "" : v)
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Filtrar por cliente">
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

      <DataTable columns={columns} data={tickets} isLoading={isLoading} />

      <TicketModal
        open={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        cedisId={cedisId}
      />
      <BatchModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        cedisId={cedisId}
      />
    </div>
  )
}
