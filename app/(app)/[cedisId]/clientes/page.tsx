"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Users, PowerOff } from "lucide-react"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { KbdShortcut } from "@/components/common/kbd-shortcut"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ClienteModal } from "@/components/clientes/cliente-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClientes, useUpdateCliente } from "@/hooks/use-clientes"
import { formatShortId } from "@/lib/utils/format"
import type { Cliente } from "@/types/app.types"

export default function ClientesPage() {
  const params = useParams()
  const cedisId = params.cedisId as string

  const [modalOpen, setModalOpen] = useState(false)
  useKeyboardShortcut("n", useCallback(() => { setEditingCliente(undefined); setModalOpen(true) }, []), { enabled: !modalOpen })
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>()
  const [confirmDeactivate, setConfirmDeactivate] = useState<Cliente | null>(
    null
  )

  const { data: res, isLoading } = useClientes(cedisId)
  const updateCliente = useUpdateCliente(cedisId)
  const clientes = res?.data ?? []

  async function handleDeactivate() {
    if (!confirmDeactivate) return
    const res = await updateCliente.mutateAsync({
      id: confirmDeactivate.id,
      data: { activo: false },
    })
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`${confirmDeactivate.nombre} desactivado`)
    setConfirmDeactivate(null)
  }

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre}</span>
      ),
    },
    {
      accessorKey: "telefono",
      header: "Telefono",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.telefono ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.email ?? "—"}
        </span>
      ),
    },
    {
      id: "uuid",
      header: "ID",
      cell: ({ row }) => (
        <span
          className="font-mono text-xs text-muted-foreground"
          title={row.original.id}
        >
          {formatShortId(row.original.id)}
        </span>
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
              onClick={() => {
                setEditingCliente(row.original)
                setModalOpen(true)
              }}
            >
              Editar
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
        title="Clientes"
        description="Administra los clientes del CEDIS"
        actions={
          <Button
            onClick={() => {
              setEditingCliente(undefined)
              setModalOpen(true)
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
            Nuevo cliente<KbdShortcut keys="n" />
          </Button>
        }
      />

      {!isLoading && clientes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description="Agrega tu primer cliente para comenzar a registrar ventas."
          action={{
            label: "Nuevo cliente",
            onClick: () => {
              setEditingCliente(undefined)
              setModalOpen(true)
            },
          }}
        />
      ) : (
        <DataTable columns={columns} data={clientes} isLoading={isLoading} />
      )}

      <ClienteModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingCliente(undefined)
        }}
        cedisId={cedisId}
        cliente={editingCliente}
      />

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Desactivar cliente"
        description={`¿Estas seguro de que deseas desactivar a "${confirmDeactivate?.nombre}"? El registro no sera eliminado y podra reactivarse.`}
        confirmLabel="Desactivar"
        loading={updateCliente.isPending}
      />
    </div>
  )
}
