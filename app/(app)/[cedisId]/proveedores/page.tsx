"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, Truck, PowerOff } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ProveedorModal } from "@/components/proveedores/proveedor-modal"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProveedores, useUpdateProveedor } from "@/hooks/use-proveedores"
import { useInsumos } from "@/hooks/use-insumos"
import type { Proveedor } from "@/types/app.types"

export default function ProveedoresPage() {
  const params = useParams()
  const cedisId = params.cedisId as string

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<
    Proveedor | undefined
  >()
  const [confirmDeactivate, setConfirmDeactivate] =
    useState<Proveedor | null>(null)

  const { data: res, isLoading } = useProveedores(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const updateProveedor = useUpdateProveedor(cedisId)

  const proveedores = res?.data ?? []
  const insumos = insumosRes?.data ?? []

  function countInsumos(proveedorId: string): number {
    return insumos.filter((i) => i.proveedor_id === proveedorId).length
  }

  async function handleDeactivate() {
    if (!confirmDeactivate) return
    const res = await updateProveedor.mutateAsync({
      id: confirmDeactivate.id,
      data: { activo: false },
    })
    if (res.error) {
      toast.error("Error al desactivar proveedor")
      return
    }
    toast.success(`${confirmDeactivate.nombre} desactivado`)
    setConfirmDeactivate(null)
  }

  const columns: ColumnDef<Proveedor>[] = [
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
      id: "insumos_count",
      header: "# Insumos",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {countInsumos(row.original.id)}
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
                setEditingProveedor(row.original)
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
        title="Proveedores"
        description="Gestiona los proveedores de insumos del CEDIS"
        actions={
          <Button
            onClick={() => {
              setEditingProveedor(undefined)
              setModalOpen(true)
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
            Nuevo proveedor
          </Button>
        }
      />

      {!isLoading && proveedores.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Sin proveedores"
          description="Agrega tu primer proveedor para asociarlo a los insumos."
          action={{
            label: "Nuevo proveedor",
            onClick: () => {
              setEditingProveedor(undefined)
              setModalOpen(true)
            },
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={proveedores}
          isLoading={isLoading}
        />
      )}

      <ProveedorModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingProveedor(undefined)
        }}
        cedisId={cedisId}
        proveedor={editingProveedor}
      />

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Desactivar proveedor"
        description={`¿Estas seguro de que deseas desactivar a "${confirmDeactivate?.nombre}"? El registro no sera eliminado y podra reactivarse.`}
        confirmLabel="Desactivar"
        loading={updateProveedor.isPending}
      />
    </div>
  )
}
