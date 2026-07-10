"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/common/status-badge"
import { FolioCell } from "@/components/common/folio-cell"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
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
import {
  useVenta,
  useConfirmarVenta,
  useEntregarVenta,
  useCancelVenta,
} from "@/hooks/use-ventas"
import { useInsumos } from "@/hooks/use-insumos"
import { useUnidadesMedida } from "@/hooks/use-uom"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format"

export default function VentaDetailPage() {
  const { cedisId, id } = useParams<{ cedisId: string; id: string }>()
  const router = useRouter()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [entregarOpen, setEntregarOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data: res, isLoading } = useVenta(cedisId, id)
  const { data: insumosRes } = useInsumos(cedisId, { pageSize: 1000 })
  const { data: uomRes } = useUnidadesMedida()
  const insumos = insumosRes?.data ?? []
  const unidades = uomRes?.data ?? []

  function getPrecioBase(insumoId: string, selectedUnitId: string, storedPrice: number): { precio: number; simbolo: string } {
    const ins = insumos.find(i => i.id === insumoId)
    const selectedUnit = unidades.find(u => u.id === selectedUnitId)
    const baseUnit = ins ? unidades.find(u => u.id === ins.unidad_id) : undefined
    if (!selectedUnit || !baseUnit || selectedUnit.id === baseUnit.id) {
      return { precio: storedPrice, simbolo: selectedUnit?.simbolo ?? "" }
    }
    const precioBase = storedPrice * (Number(baseUnit.factor) / Number(selectedUnit.factor))
    return { precio: precioBase, simbolo: baseUnit.simbolo }
  }

  const confirmar = useConfirmarVenta(cedisId)
  const entregar = useEntregarVenta(cedisId)
  const cancel = useCancelVenta(cedisId)

  const ticket = res?.data

  async function handleConfirmar() {
    const r = await confirmar.mutateAsync(id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Ticket confirmado")
    setConfirmOpen(false)
  }

  async function handleEntregar() {
    const r = await entregar.mutateAsync(id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Ticket marcado como entregado — stock actualizado")
    setEntregarOpen(false)
  }

  async function handleCancel() {
    const r = await cancel.mutateAsync(id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Ticket cancelado")
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

  if (!ticket) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Ticket no encontrado.</p>
      </div>
    )
  }

  const isDraft = ticket.status === "draft"
  const isConfirmed = ticket.status === "confirmed"
  const items = ticket.items ?? ticket.partidas ?? []
  const total = ticket.total ?? 0

  return (
    <div className="p-6 space-y-6 max-w-4xl print:p-4">
      <div className="hidden print:block mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">cEdis</h1>
            <p className="text-sm text-muted-foreground">Ticket de Distribución</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-bold">{ticket.folio}</p>
            <p>{formatDate(ticket.created_at)}</p>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Cliente</p>
            <p>{ticket.cliente?.nombre ?? ticket.cliente_id}</p>
            {ticket.cliente?.telefono && <p className="text-muted-foreground">{ticket.cliente.telefono}</p>}
          </div>
          <div>
            <p className="font-medium">Estado</p>
            <p>{ticket.status}</p>
            {ticket.entregado_at && <p className="text-muted-foreground">Entregado: {formatDateTime(ticket.entregado_at)}</p>}
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/${cedisId}/ventas`)}
          className="mb-4 -ml-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1" aria-hidden />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Ticket</h1>
            <FolioCell folio={ticket.folio} />
            <StatusBadge status={ticket.status} tipo="ticket" />
          </div>
          <p className="text-sm text-muted-foreground">
            Creado el {formatDateTime(ticket.created_at)}
          </p>
          {ticket.cliente && (
            <p className="text-sm">
              <span className="text-muted-foreground">Cliente: </span>
              {ticket.cliente.nombre}
              {ticket.cliente.email && (
                <span className="text-muted-foreground ml-2">
                  ({ticket.cliente.email})
                </span>
              )}
            </p>
          )}
          {ticket.notas && (
            <p className="text-sm">
              <span className="text-muted-foreground">Notas: </span>
              {ticket.notas}
            </p>
          )}
          {ticket.entregado_at && (
            <p className="text-sm text-muted-foreground">
              Entregado el {formatDateTime(ticket.entregado_at)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" aria-hidden />
            Imprimir
          </Button>
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
          {isConfirmed && (
            <Button size="sm" onClick={() => setEntregarOpen(true)}>
              <Truck className="h-4 w-4 mr-1.5" aria-hidden />
              Entregar
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Insumo</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Precio unit.</TableHead>
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
              const unidadSimbolo = unidadRaw
                ? typeof unidadRaw === "object"
                  ? (unidadRaw as { simbolo: string }).simbolo
                  : (unidadRaw as string)
                : "unidad_id" in item
                ? (item as { unidad_id: string }).unidad_id
                : ""
              const storedPrecio = "precio_unitario" in item ? Number(item.precio_unitario) : 0
              const subtotal =
                (item as { subtotal?: number }).subtotal ??
                item.cantidad * storedPrecio

              const insumoId = "insumo_id" in item ? (item.insumo_id ?? "") : ""
              const unitId = "unidad_id" in item ? (item as { unidad_id: string }).unidad_id : ""
              const { precio: precioBase, simbolo: baseSimb } = getPrecioBase(insumoId, unitId, storedPrecio)
              const sameUnit = baseSimb === unidadSimbolo || !baseSimb

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{nombre}</TableCell>
                  <TableCell>
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
                  <TableCell className="font-mono text-xs">{unidadSimbolo}</TableCell>
                  <TableCell className="text-right font-mono">
                    <span>{formatCurrency(precioBase)}</span>
                    {!sameUnit && (
                      <span className="text-muted-foreground text-xs ml-1">/{baseSimb}</span>
                    )}
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
          <p className="text-sm text-muted-foreground">Total</p>
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
        title="Confirmar ticket"
        description="El ticket pasara a estado confirmado."
        confirmLabel="Confirmar ticket"
        loading={confirmar.isPending}
      />

      <ConfirmDialog
        open={entregarOpen}
        onClose={() => setEntregarOpen(false)}
        onConfirm={handleEntregar}
        title="Marcar como entregado"
        description="Al marcar como entregado, el stock de insumos sera descontado. Esta accion no se puede deshacer."
        confirmLabel="Marcar entregado"
        loading={entregar.isPending}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancelar ticket"
        description="Se cancelara este ticket."
        confirmLabel="Cancelar ticket"
        loading={cancel.isPending}
      />
    </div>
  )
}
