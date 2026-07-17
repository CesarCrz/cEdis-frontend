"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/common/status-badge"
import { FolioCell } from "@/components/common/folio-cell"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PrintButton } from "@/components/common/print-button"
import { useEntrada, useConfirmarEntrada, useCancelEntrada } from "@/hooks/use-entradas"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format"

export default function EntradaDetailPage() {
  const { cedisId, id } = useParams<{ cedisId: string; id: string }>()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data: res, isLoading } = useEntrada(cedisId, id)
  const confirmar = useConfirmarEntrada(cedisId)
  const cancel = useCancelEntrada(cedisId)

  const entrada = res?.data

  async function handleConfirmar() {
    const r = await confirmar.mutateAsync(id)
    if (r.error) {
      toast.error(r.error)
      return
    }
    toast.success("Entrada confirmada — stock actualizado")
    setConfirmOpen(false)
  }

  async function handleCancel() {
    const r = await cancel.mutateAsync(id)
    if (r.error) {
      toast.error(r.error)
      return
    }
    toast.success("Entrada cancelada")
    setCancelOpen(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!entrada) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Entrada no encontrada.</p>
      </div>
    )
  }

  const isDraft = entrada.status === "draft" || !entrada.status
  const items = entrada.items ?? entrada.partidas ?? []
  const total = entrada.total_costo ?? entrada.total ?? 0

  return (
    <div className="p-6 space-y-6 max-w-4xl print:p-0">
      <div className="hidden print:block mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">cEdis</h1>
            <p className="text-sm text-muted-foreground">Entrada de Mercancía</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-bold">{entrada.folio}</p>
            <p>{formatDate(entrada.created_at)}</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Proveedor</p>
            <p>{entrada.proveedor?.nombre ?? "—"}</p>
          </div>
          <div>
            <p className="font-medium">Estado</p>
            <p>{entrada.status ?? "draft"}</p>
            {entrada.confirmado_at && <p className="text-muted-foreground">Confirmado: {formatDateTime(entrada.confirmado_at)}</p>}
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${cedisId}/entradas`)}
          className="mb-4 -ml-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" aria-hidden />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Entrada</h1>
            <FolioCell folio={entrada.folio} />
            <StatusBadge
              status={entrada.status ?? "draft"}
              tipo="entrada"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Creada el {formatDateTime(entrada.created_at)}
          </p>
          {entrada.proveedor && (
            <p className="text-sm">
              <span className="text-muted-foreground">Proveedor: </span>
              {entrada.proveedor.nombre}
            </p>
          )}
          {entrada.notas && (
            <p className="text-sm">
              <span className="text-muted-foreground">Notas: </span>
              {entrada.notas}
            </p>
          )}
          {entrada.confirmado_at && (
            <p className="text-sm text-muted-foreground">
              Confirmada el {formatDateTime(entrada.confirmado_at)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <PrintButton />
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="h-4 w-4 mr-1.5" aria-hidden />
                Cancelar
              </Button>
              <Button size="sm" onClick={() => setConfirmOpen(true)}>
                <CheckCircle className="h-4 w-4 mr-1.5" aria-hidden />
                Confirmar
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Insumo</TableHead>
              <TableHead className="print-mini-hide">SKU</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right print-mini-hide">Costo unit.</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const nombre =
                "insumo" in item && item.insumo
                  ? item.insumo.nombre
                  : "insumo_id" in item
                  ? item.insumo_id
                  : "—"
              const sku =
                "insumo" in item && item.insumo ? item.insumo.sku : null
              const unidadRaw = "unidad" in item ? item.unidad : undefined
              const unidad = unidadRaw
                ? typeof unidadRaw === "object"
                  ? (unidadRaw as { simbolo: string }).simbolo
                  : (unidadRaw as string)
                : "unidad_id" in item
                ? (item as { unidad_id: string }).unidad_id
                : ""
              const subtotal = item.cantidad * item.costo_unitario

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{nombre}</TableCell>
                  <TableCell className="print-mini-hide">
                    {sku ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {sku}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.cantidad}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{unidad}</TableCell>
                  <TableCell className="text-right font-mono print-mini-hide">
                    {formatCurrency(item.costo_unitario)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(subtotal)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <div className="rounded-lg border bg-muted/30 px-6 py-3 flex items-center gap-6">
          <p className="text-sm text-muted-foreground">Total costo</p>
          <p className="text-xl font-bold font-mono">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="hidden print:block mt-8 pt-4 border-t text-xs text-muted-foreground text-center">
        cEdis — Generado el {formatDateTime(new Date().toISOString())}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmar}
        title="Confirmar entrada"
        description="Al confirmar esta entrada, el stock de los insumos sera actualizado. Esta accion no se puede deshacer."
        confirmLabel="Confirmar entrada"
        loading={confirmar.isPending}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar entrada"
        description="Se cancelara esta entrada. El stock no sera modificado."
        confirmLabel="Cancelar entrada"
        loading={cancel.isPending}
      />
    </div>
  )
}
