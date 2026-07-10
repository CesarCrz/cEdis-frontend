"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { PlusCircle, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { KbdShortcut } from "@/components/common/kbd-shortcut"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { FolioCell } from "@/components/common/folio-cell"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { VentaDeclaradaModal } from "@/components/ventas-declaradas/venta-declarada-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVentasDeclaradas, useDeleteVentaDeclarada } from "@/hooks/use-ventas-declaradas"
import { useClientes } from "@/hooks/use-clientes"
import { useCanales } from "@/hooks/use-canales"
import { formatDate } from "@/lib/utils/format"
import type { VentaDeclarada } from "@/types/app.types"

export default function VentasDeclaradasPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const router = useRouter()

  const [clienteFilter, setClienteFilter] = useState("")
  const [canalFilter, setCanalFilter] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<VentaDeclarada | null>(null)
  useKeyboardShortcut("n", useCallback(() => setModalOpen(true), []), { enabled: !modalOpen })

  const deleteVenta = useDeleteVentaDeclarada(cedisId)

  const filters = {
    ...(clienteFilter && clienteFilter !== "__todos__"
      ? { cliente_id: clienteFilter }
      : {}),
    ...(canalFilter && canalFilter !== "__todos__"
      ? { canal_id: canalFilter }
      : {}),
    ...(desde ? { desde } : {}),
    ...(hasta ? { hasta } : {}),
  }

  const { data: res, isLoading } = useVentasDeclaradas(cedisId, filters)
  const { data: clientesRes } = useClientes(cedisId)
  const { data: canalesRes } = useCanales(cedisId)

  const ventas = res?.data ?? []
  const clientes = clientesRes?.data ?? []
  const canales = canalesRes?.data ?? []

  async function handleDelete() {
    if (!confirmDelete) return
    const res = await deleteVenta.mutateAsync(confirmDelete.id)
    if (res.error) { toast.error(res.error); return }
    toast.success("Declaracion eliminada")
    setConfirmDelete(null)
  }

  const hasFilters = !!clienteFilter || !!canalFilter || !!desde || !!hasta

  function clearFilters() {
    setClienteFilter("")
    setCanalFilter("")
    setDesde("")
    setHasta("")
  }

  const columns: ColumnDef<VentaDeclarada>[] = [
    {
      id: "folio",
      header: "Folio",
      cell: ({ row }) =>
        row.original.folio ? (
          <FolioCell folio={row.original.folio} />
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.id.slice(0, 8).toUpperCase()}
          </span>
        ),
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
      id: "canal",
      header: "Canal",
      cell: ({ row }) =>
        row.original.canal ? (
          <span className="text-sm">{row.original.canal.nombre}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        ),
    },
    {
      id: "periodo",
      header: "Periodo",
      cell: ({ row }) => {
        const inicio = row.original.periodo_inicio ?? row.original.fecha
        const fin = row.original.periodo_fin
        if (!inicio) return <span className="text-muted-foreground/50 text-xs">—</span>
        return (
          <span className="text-sm font-mono text-muted-foreground">
            {formatDate(inicio)}
            {fin ? ` – ${formatDate(fin)}` : ""}
          </span>
        )
      },
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
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${cedisId}/ventas-declaradas/${row.original.id}`)}
          >
            Ver
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmDelete(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader
        title="Ventas Declaradas"
        description="Declaraciones de venta por canal y periodo"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
            Nueva declaracion<KbdShortcut keys="n" />
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
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

        <Select
          value={canalFilter || "__todos__"}
          onValueChange={(v) => setCanalFilter(v === "__todos__" ? "" : v)}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filtrar por canal">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todos los canales</SelectItem>
            {canales.map((c) => (
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

      <DataTable columns={columns} data={ventas} isLoading={isLoading} />

      <VentaDeclaradaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cedisId={cedisId}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar declaracion"
        description={`¿Eliminar la declaracion de ${confirmDelete?.cliente?.nombre ?? ""}? Se eliminarán también las entradas del kardex asociadas.`}
        confirmLabel="Eliminar"
        loading={deleteVenta.isPending}
      />
    </div>
  )
}
