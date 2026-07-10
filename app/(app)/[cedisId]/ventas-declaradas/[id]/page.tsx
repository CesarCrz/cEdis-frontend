"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useVentaDeclarada, useDeleteVentaDeclarada } from "@/hooks/use-ventas-declaradas"
import { formatDate } from "@/lib/utils/format"

export default function VentaDeclaradaDetailPage() {
  const { cedisId, id } = useParams<{ cedisId: string; id: string }>()
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: res, isLoading } = useVentaDeclarada(cedisId, id)
  const deleteVenta = useDeleteVentaDeclarada(cedisId)

  const venta = res?.data

  async function handleDelete() {
    const result = await deleteVenta.mutateAsync(id)
    if (result.error) { toast.error(result.error); return }
    toast.success("Declaracion eliminada")
    router.push(`/${cedisId}/ventas-declaradas`)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="p-6 text-muted-foreground text-sm">
        Declaracion no encontrada.
      </div>
    )
  }

  const items = (venta.items ?? venta.partidas ?? []) as Array<{
    id: string
    receta_id: string
    cantidad_vendida?: number
    cantidad?: number
    receta?: { nombre: string } | null
    variacion?: { nombre: string; factor: number } | null
  }>

  const consumo = (venta as unknown as { consumo_calculado?: Array<{ insumo_id: string; nombre: string; consumo_total: number }> })
    .consumo_calculado ?? []

  const folioDisplay = venta.folio ?? venta.id.slice(0, 8).toUpperCase()

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/${cedisId}/ventas-declaradas`)}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
              Declaracion {folioDisplay}
            </p>
            <h1 className="text-xl font-semibold">
              {venta.cliente?.nombre ?? "—"}
            </h1>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Eliminar
        </Button>
      </div>

      {/* Meta */}
      <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Canal</p>
          <p className="font-medium">{venta.canal?.nombre ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Fecha registro</p>
          <p className="font-medium">{formatDate(venta.created_at)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Periodo inicio</p>
          <p className="font-medium">{venta.periodo_inicio ? formatDate(venta.periodo_inicio) : formatDate(venta.fecha)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Periodo fin</p>
          <p className="font-medium">{venta.periodo_fin ? formatDate(venta.periodo_fin) : "—"}</p>
        </div>
        {venta.notas && (
          <div className="col-span-2 sm:col-span-4">
            <p className="text-xs text-muted-foreground mb-0.5">Notas</p>
            <p className="text-muted-foreground">{venta.notas}</p>
          </div>
        )}
      </div>

      {/* Items declarados */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Platillos declarados</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Receta</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Variacion</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-xs">Sin platillos registrados</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{item.receta?.nombre ?? item.receta_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.variacion?.nombre ?? "N/A"}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.cantidad_vendida ?? item.cantidad ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumo calculado por insumo */}
      {consumo.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3">Consumo teórico de insumos</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Insumo</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Consumo total</th>
                </tr>
              </thead>
              <tbody>
                {consumo.map((c) => (
                  <tr key={c.insumo_id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3 text-right font-mono text-orange-600">
                      {c.consumo_total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Eliminar declaracion"
        description="¿Eliminar esta declaracion? Se eliminarán también las entradas del kardex asociadas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        loading={deleteVenta.isPending}
      />
    </div>
  )
}
