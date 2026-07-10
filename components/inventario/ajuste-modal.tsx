"use client"

import { useState, useCallback } from "react"
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useAjusteManual } from "@/hooks/use-inventario"
import { useInsumos } from "@/hooks/use-insumos"
import type { InventarioItem } from "@/types/app.types"

interface AjusteRow {
  id: string
  insumo_id: string
  cantidad_nueva: string
}

interface AjusteModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  inventario: InventarioItem[]
}

function makeRow(): AjusteRow {
  return { id: crypto.randomUUID(), insumo_id: "", cantidad_nueva: "" }
}

export function AjusteModal({ open, onClose, cedisId, inventario }: AjusteModalProps) {
  const [rows, setRows] = useState<AjusteRow[]>([makeRow()])
  const [motivo, setMotivo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  const ajuste = useAjusteManual(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const insumos = insumosRes?.data ?? []

  function handleClose() {
    setRows([makeRow()])
    setMotivo("")
    setOpenRowId(null)
    onClose()
  }

  function addRow() {
    const newRow = makeRow()
    setRows((prev) => [...prev, newRow])
    setOpenRowId(newRow.id)
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id)
      return next.length === 0 ? [makeRow()] : next
    })
    if (openRowId === id) setOpenRowId(null)
  }

  const updateRow = useCallback((id: string, field: keyof AjusteRow, value: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  function getStockActual(insumoId: string) {
    const item = inventario.find((i) => i.insumo_id === insumoId)
    if (!item) return null
    return `${item.stock_actual} ${item.unidad_simbolo}`
  }

  function usedIds(currentRowId: string) {
    return new Set(rows.filter((r) => r.id !== currentRowId && r.insumo_id).map((r) => r.insumo_id))
  }

  async function handleSubmit() {
    if (!motivo.trim()) {
      toast.error("Motivo requerido")
      return
    }
    const validRows = rows.filter((r) => r.insumo_id && r.cantidad_nueva !== "")
    if (validRows.length === 0) {
      toast.error("Agrega al menos un insumo")
      return
    }
    for (const r of validRows) {
      const val = parseFloat(r.cantidad_nueva)
      if (isNaN(val) || val < 0) {
        const ins = insumos.find((i) => i.id === r.insumo_id)
        toast.error(`Cantidad inválida para ${ins?.nombre ?? r.insumo_id}`)
        return
      }
    }

    setSubmitting(true)
    let errorCount = 0
    for (const r of validRows) {
      const res = await ajuste.mutateAsync({
        insumo_id: r.insumo_id,
        cantidad_nueva: parseFloat(r.cantidad_nueva),
        motivo: motivo.trim(),
      })
      if (res.error) {
        const ins = insumos.find((i) => i.id === r.insumo_id)
        toast.error(`${ins?.nombre ?? "Insumo"}: ${res.error}`)
        errorCount++
      }
    }
    setSubmitting(false)

    if (errorCount === 0) {
      toast.success(validRows.length === 1 ? "Ajuste aplicado" : `${validRows.length} ajustes aplicados`)
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajuste manual de stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motivo <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Describe el motivo del ajuste (aplica a todos los insumos)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-[1fr_160px_36px] gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insumo</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nueva cantidad</span>
            <span />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {rows.map((row) => {
              const stockActual = getStockActual(row.insumo_id)
              const taken = usedIds(row.id)
              const selectedInsumo = insumos.find((i) => i.id === row.insumo_id)

              return (
                <div key={row.id} className="grid grid-cols-[1fr_160px_36px] gap-2 items-start">
                  <div>
                    <Popover
                      open={openRowId === row.id}
                      onOpenChange={(o) => setOpenRowId(o ? row.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring",
                            !selectedInsumo && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {selectedInsumo ? selectedInsumo.nombre : "Buscar insumo..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar insumo..." />
                          <CommandList>
                            <CommandEmpty>Sin resultados.</CommandEmpty>
                            <CommandGroup>
                              {insumos
                                .filter((ins) => !taken.has(ins.id) || ins.id === row.insumo_id)
                                .map((ins) => (
                                  <CommandItem
                                    key={ins.id}
                                    value={ins.nombre}
                                    onSelect={() => {
                                      updateRow(row.id, "insumo_id", ins.id)
                                      setOpenRowId(null)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        row.insumo_id === ins.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="flex-1 truncate">{ins.nombre}</span>
                                    {ins.sku && (
                                      <span className="ml-2 text-xs text-muted-foreground shrink-0">{ins.sku}</span>
                                    )}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {stockActual && (
                      <p className="text-xs text-muted-foreground mt-1 pl-1">
                        Stock actual: <span className="font-mono font-medium">{stockActual}</span>
                      </p>
                    )}
                  </div>

                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={row.cantidad_nueva}
                    onChange={(e) => updateRow(row.id, "cantidad_nueva", e.target.value)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            Agregar insumo
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Aplicando..." : `Aplicar ajuste${rows.filter((r) => r.insumo_id).length > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
