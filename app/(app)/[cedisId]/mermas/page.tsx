"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Check, ChevronsUpDown, Plus, PlusCircle, Trash2, Search } from "lucide-react"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { KbdShortcut } from "@/components/common/kbd-shortcut"
import { toast } from "sonner"

import { useMermas, useCreateMerma } from "@/hooks/use-mermas"
import { useInsumos } from "@/hooks/use-insumos"
import { useUom } from "@/hooks/use-uom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils/format"
import type { Merma } from "@/types/app.types"

interface MermaRow {
  id: string
  insumo_id: string
  cantidad: string
  unidad_id: string
}

function makeRow(): MermaRow {
  return { id: crypto.randomUUID(), insumo_id: "", cantidad: "", unidad_id: "" }
}

export default function MermasPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  useKeyboardShortcut("n", useCallback(() => setModalOpen(true), []), { enabled: !modalOpen })

  const { data: res, isLoading } = useMermas(cedisId)
  const mermas: Merma[] = (res?.data as Merma[] | undefined) ?? []

  const filtered = search.trim()
    ? mermas.filter((m) =>
        m.insumo?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        m.motivo?.toLowerCase().includes(search.toLowerCase())
      )
    : mermas

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Mermas"
          description="Registro de pérdidas y desperdicios de insumos"
        />
        <Button onClick={() => setModalOpen(true)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden />
          Registrar merma<KbdShortcut keys="n" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Buscar insumo o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Insumo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cantidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Motivo
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {search ? "Sin resultados" : "Sin mermas registradas"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground text-[13px] font-mono-data whitespace-nowrap">
                    {formatDate(m.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{m.insumo?.nombre ?? "—"}</span>
                    {m.insumo?.sku && (
                      <span className="ml-2 text-[11px] text-muted-foreground font-mono">
                        {m.insumo.sku}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-foreground">
                    {m.cantidad}{" "}
                    <span className="text-muted-foreground text-xs">{m.unidad?.simbolo}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-[13px] max-w-xs truncate">
                    {m.motivo}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MermaModal
        open={modalOpen}
        cedisId={cedisId}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

function MermaModal({
  open,
  cedisId,
  onClose,
}: {
  open: boolean
  cedisId: string
  onClose: () => void
}) {
  const createMerma = useCreateMerma(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const { data: uomRes } = useUom()

  const insumos = (insumosRes?.data as { id: string; nombre: string; sku?: string | null; unidad_id?: string | null }[] | undefined) ?? []
  const uoms = uomRes?.data ?? []

  const [rows, setRows] = useState<MermaRow[]>([makeRow()])
  const [motivo, setMotivo] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [openRowId, setOpenRowId] = useState<string | null>(null)

  function handleClose() {
    setRows([makeRow()])
    setMotivo("")
    setOpenRowId(null)
    onClose()
  }

  function addRow() {
    const r = makeRow()
    setRows((prev) => [...prev, r])
    setOpenRowId(r.id)
  }

  function removeRow(id: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id)
      return next.length === 0 ? [makeRow()] : next
    })
    if (openRowId === id) setOpenRowId(null)
  }

  const updateRow = useCallback((id: string, patch: Partial<MermaRow>) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r))
  }, [])

  function usedIds(currentId: string) {
    return new Set(rows.filter((r) => r.id !== currentId && r.insumo_id).map((r) => r.insumo_id))
  }

  async function handleSubmit() {
    if (!motivo.trim()) { toast.error("Motivo requerido"); return }
    const valid = rows.filter((r) => r.insumo_id && r.cantidad !== "" && r.unidad_id)
    if (valid.length === 0) { toast.error("Agrega al menos un insumo"); return }
    for (const r of valid) {
      const val = parseFloat(r.cantidad)
      if (isNaN(val) || val <= 0) {
        const ins = insumos.find((i) => i.id === r.insumo_id)
        toast.error(`Cantidad inválida para ${ins?.nombre ?? r.insumo_id}`)
        return
      }
    }

    setSubmitting(true)
    let errors = 0
    for (const r of valid) {
      const { error } = await createMerma.mutateAsync({
        insumo_id: r.insumo_id,
        cantidad: parseFloat(r.cantidad),
        unidad_id: r.unidad_id,
        motivo: motivo.trim(),
      })
      if (error) {
        const ins = insumos.find((i) => i.id === r.insumo_id)
        toast.error(`${ins?.nombre ?? "Insumo"}: ${error}`)
        errors++
      }
    }
    setSubmitting(false)
    if (errors === 0) {
      toast.success(valid.length === 1 ? "Merma registrada" : `${valid.length} mermas registradas`)
      handleClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar merma</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motivo <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Describe la causa de la merma (aplica a todos los insumos)..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-[1fr_150px_120px_36px] gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insumo</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Unidad</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cantidad</span>
            <span />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {rows.map((row) => {
              const taken = usedIds(row.id)
              const selectedInsumo = insumos.find((i) => i.id === row.insumo_id)

              return (
                <div key={row.id} className="grid grid-cols-[1fr_150px_120px_36px] gap-2 items-start">
                  {/* Insumo combobox */}
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
                                    updateRow(row.id, {
                                      insumo_id: ins.id,
                                      unidad_id: ins.unidad_id ?? "",
                                    })
                                    setOpenRowId(null)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4 shrink-0", row.insumo_id === ins.id ? "opacity-100" : "opacity-0")} />
                                  <span className="flex-1 truncate">{ins.nombre}</span>
                                  {ins.sku && <span className="ml-2 text-xs text-muted-foreground shrink-0">{ins.sku}</span>}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Unidad */}
                  <Select
                    value={row.unidad_id}
                    onValueChange={(v) => updateRow(row.id, { unidad_id: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Unidad..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uoms.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.simbolo} — {u.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Cantidad */}
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={row.cantidad}
                    onChange={(e) => updateRow(row.id, { cantidad: e.target.value })}
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
          <Button variant="outline" onClick={handleClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : `Registrar merma${rows.filter((r) => r.insumo_id).length > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
