"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, PlusCircle, ChefHat, Copy, PowerOff, Search, X } from "lucide-react"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { KbdShortcut } from "@/components/common/kbd-shortcut"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { DataTable } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { RecetaModal } from "@/components/recetas/receta-modal"
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
import { useRecetas, useUpdateReceta, useCloneReceta } from "@/hooks/use-recetas"
import { formatCurrency } from "@/lib/utils/format"
import { useRecetaCategorias } from "@/hooks/use-receta-categorias"
import type { Receta } from "@/types/app.types"

export default function RecetasPage() {
  const params = useParams()
  const cedisId = params.cedisId as string

  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [pageIndex, setPageIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  useKeyboardShortcut("n", useCallback(() => { setEditingReceta(undefined); setModalOpen(true) }, []), { enabled: !modalOpen })
  const [editingReceta, setEditingReceta] = useState<Receta | undefined>()
  const [confirmDeactivate, setConfirmDeactivate] = useState<Receta | null>(null)

  const { data: res, isLoading } = useRecetas(cedisId, { pageSize: 500 } as Parameters<typeof useRecetas>[1])
  const { data: catRes } = useRecetaCategorias(cedisId)
  const updateReceta = useUpdateReceta(cedisId)
  const cloneReceta = useCloneReceta(cedisId)

  const allRecetas = res?.data ?? []
  const categorias = catRes?.data ?? []

  const recetas = allRecetas.filter((r) => {
    if (search && !r.nombre.toLowerCase().includes(search.toLowerCase())) return false
    if (categoriaFilter && categoriaFilter !== "__todos__" && r.categoria_id !== categoriaFilter) return false
    return true
  })

  const hasFilters = !!search || (!!categoriaFilter && categoriaFilter !== "__todos__")

  const PAGE_SIZE = 50
  const pageCount = Math.ceil(recetas.length / PAGE_SIZE)
  const paginatedRecetas = recetas.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)

  async function handleDeactivate() {
    if (!confirmDeactivate) return
    const res = await updateReceta.mutateAsync({ id: confirmDeactivate.id, data: { activo: false } })
    if (res.error) { toast.error(res.error); return }
    toast.success(`${confirmDeactivate.nombre} desactivada`)
    setConfirmDeactivate(null)
  }

  async function handleClone(receta: Receta) {
    const res = await cloneReceta.mutateAsync(receta.id)
    if (res.error) { toast.error(res.error); return }
    toast.success("Receta clonada")
  }

  const columns: ColumnDef<Receta>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div>
          <span className="font-medium">{row.original.nombre}</span>
          {row.original.categoria && (
            <Badge variant="outline" className="ml-2 text-xs font-normal">
              {row.original.categoria.nombre}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "rendimiento",
      header: "Rendimiento",
      cell: ({ row }) => {
        const r = row.original
        const simbolo = r.rendimiento_unidad?.simbolo ?? ""
        return (
          <span className="font-mono text-sm text-muted-foreground">
            {r.rendimiento ?? 1}{simbolo ? ` ${simbolo}` : ""}
          </span>
        )
      },
    },
    {
      id: "costo",
      header: "Costo teórico",
      cell: ({ row }) => {
        const costo = Number((row.original as { costo_teorico_base?: number }).costo_teorico_base ?? 0)
        return costo > 0 ? (
          <span className="font-mono text-sm">{formatCurrency(costo)}</span>
        ) : (
          <span className="text-muted-foreground/50 text-xs">—</span>
        )
      },
    },
    {
      id: "variaciones",
      header: "Variaciones",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.original.variaciones?.length ?? 0}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label={`Acciones para ${row.original.nombre}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditingReceta(row.original); setModalOpen(true) }}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleClone(row.original)}>
              <Copy className="h-4 w-4 mr-2" />
              Clonar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmDeactivate(row.original)}>
              <PowerOff className="h-4 w-4 mr-2" />
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
        description="Define las fórmulas y costos de tus productos"
        actions={
          <Button onClick={() => { setEditingReceta(undefined); setModalOpen(true) }}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva receta<KbdShortcut keys="n" />
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receta..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageIndex(0) }}
            className="pl-8"
          />
        </div>
        <Select value={categoriaFilter || "__todos__"} onValueChange={(v) => { setCategoriaFilter(v === "__todos__" ? "" : v); setPageIndex(0) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__todos__">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategoriaFilter(""); setPageIndex(0) }}>
            <X className="h-4 w-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {!isLoading && allRecetas.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Sin recetas"
          description="Crea tu primera receta para calcular costos y controlar el inventario."
          action={{ label: "Nueva receta", onClick: () => { setEditingReceta(undefined); setModalOpen(true) } }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedRecetas}
          isLoading={isLoading}
          pagination={pageCount > 1 ? { pageIndex, pageSize: PAGE_SIZE } : undefined}
          pageCount={pageCount}
          onPaginationChange={pageCount > 1 ? (p) => setPageIndex(p.pageIndex) : undefined}
        />
      )}

      <RecetaModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingReceta(undefined) }}
        cedisId={cedisId}
        receta={editingReceta}
      />

      <ConfirmDialog
        open={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={handleDeactivate}
        title="Desactivar receta"
        description={`¿Estas seguro de que deseas desactivar "${confirmDeactivate?.nombre}"? La receta no sera eliminada.`}
        confirmLabel="Desactivar"
        loading={updateReceta.isPending}
      />
    </div>
  )
}
