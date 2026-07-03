"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useInsumo } from "@/hooks/use-insumos"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { TableSkeleton } from "@/components/common/loading-skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { History } from "lucide-react"

interface PriceHistorySheetProps {
  open: boolean
  onClose: () => void
  cedisId: string
  insumoId: string
  insumoNombre: string
}

export function PriceHistorySheet({
  open,
  onClose,
  cedisId,
  insumoId,
  insumoNombre,
}: PriceHistorySheetProps) {
  const { data: res, isLoading } = useInsumo(cedisId, insumoId)
  const historial = res?.data?.historial_precios ?? []

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Historial de precios</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {insumoNombre}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {isLoading ? (
            <TableSkeleton rows={5} columns={3} />
          ) : historial.length === 0 ? (
            <EmptyState
              icon={History}
              title="Sin historial"
              description="No hay movimientos de precio registrados para este insumo."
            />
          ) : (
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Historial de precios de {insumoNombre}
                </caption>
                <thead className="bg-muted/40">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Precio
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Registrado por
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historial.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-mono text-sm">
                        {formatCurrency(entry.costo_unitario)}
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {formatDate(entry.fecha)}
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {entry.registrado_por ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
