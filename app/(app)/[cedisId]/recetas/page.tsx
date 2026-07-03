"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, ChefHat, Copy, PowerOff } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { RecetaModal } from "@/components/recetas/receta-modal"
import { RecetaCostoDisplay } from "@/components/recetas/receta-costo-display"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useRecetas,
  useUpdateReceta,
  useCloneReceta,
} from "@/hooks/use-recetas"
import { useInsumos } from "@/hooks/use-insumos"
import { formatCurrency } from "@/lib/utils/format"
import { UNITS } from "@/lib/utils/unit-conversion"
import type { Receta, Insumo } from "@/types/app.types"

function calcularCostoReceta(receta: Receta, insumos: Insumo[]): number {
  if (!receta.ingredientes) return 0
  return receta.ingredientes.reduce((acc, ing) => {
    const insumo = insumos.find((i) => i.id === ing.insumo_id)
    if (!insumo) return acc
    const costo =
      insumo.costo_unitario ?? insumo.precio_unitario ?? 0
    const insumoUnit =
      UNITS[insumo.unidad_id ?? insumo.unidad_medida]
    const recipeUnit = UNITS[ing.unidad_id ?? ing.unidad]
    if (!insumoUnit || !recipeUnit || insumoUnit.tipo !== recipeUnit.tipo) {
      return acc + ing.cantidad * costo
    }
    const cantBase = ing.cantidad * recipeUnit.toBase
    return acc + (cantBase / insumoUnit.toBase) * costo
  }, 0)
}

export default function RecetasPage() {
  const params = useParams()
  const cedisId = params.cedisId as string

  const [modalOpen, setModalOpen] = useState(false)
  const [editingReceta, setEditingReceta] = useState<Receta | undefined>()
  const [confirmDeactivate, setConfirmDeactivate] = useState<Receta | null>(
    null
  )

  const { data: res, isLoading } = useRecetas(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const updateReceta = useUpdateReceta(cedisId)
  const cloneReceta = useCloneReceta(cedisId)

  const recetas = res?.data ?? []
  const insumos: Insumo[] = insumosRes?.data ?? []

  async function handleDeactivate() {
    if (!confirmDeactivate) return
    const res = await updateReceta.mutateAsync({
      id: confirmDeactivate.id,
      data: { activo: false },
    })
    if (res.error) {
      toast.error("Error al desactivar receta")
      return
    }
    toast.success(`${confirmDeactivate.nombre} desactivada`)
    setConfirmDeactivate(null)
  }

  async function handleClone(receta: Receta) {
    const res = await cloneReceta.mutateAsync(receta.id)
    if (res.error) {
      toast.error("Error al clonar receta")
      return
    }
    toast.success("Receta clonada exitosamente")
  }

  const columns: ColumnDef<Receta>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.nombre}</span>
      ),
    },
    {
      id: "ingredientes",
      header: "Ingredientes",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.ingredientes?.length ?? 0}
        </span>
      ),
    },
    {
      id: "costo",
      header: "Costo teorico",
      cell: ({ row }) => {
        const costo = calcularCostoReceta(row.original, insumos)
        return (
          <span className="font-mono text-sm">
            {formatCurrency(costo)}
          </span>
        )
      },
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
                setEditingReceta(row.original)
                setModalOpen(true)
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleClone(row.original)}
            >
              <Copy className="h-4 w-4 mr-2" aria-hidden />
              Clonar
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
        title="Recetas"
        description="Define las formulas y costos de tus productos"
        actions={
          <Button
            onClick={() => {
              setEditingReceta(undefined)
              setModalOpen(true)
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
            Nueva receta
          </Button>
        }
      />

      {!isLoading && recetas.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Sin recetas"
          description="Crea tu primera receta para calcular costos y controlar el inventario."
          action={{
            label: "Nueva receta",
            onClick: () => {
              setEditingReceta(undefined)
              setModalOpen(true)
            },
          }}
        />
      ) : (
        <DataTable columns={columns} data={recetas} isLoading={isLoading} />
      )}

      <RecetaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingReceta(undefined)
        }}
        cedisId={cedisId}
        receta={editingReceta}
      />

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Desactivar receta"
        description={`¿Estas seguro de que deseas desactivar "${confirmDeactivate?.nombre}"? La receta no sera eliminada y podra reactivarse.`}
        confirmLabel="Desactivar"
        loading={updateReceta.isPending}
      />
    </div>
  )
}
