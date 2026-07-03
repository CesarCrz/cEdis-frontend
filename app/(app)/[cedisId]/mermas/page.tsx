"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Trash2, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useMermas, useCreateMerma } from "@/hooks/use-mermas"
import { useInsumos } from "@/hooks/use-insumos"
import { useUom } from "@/hooks/use-uom"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils/format"
import type { Merma } from "@/types/app.types"

const createMermaSchema = z.object({
  insumo_id: z.string().uuid("Selecciona un insumo"),
  cantidad: z.number().positive("Cantidad debe ser mayor a 0"),
  unidad_id: z.string().uuid("Selecciona una unidad"),
  motivo: z.string().min(1, "Motivo requerido").max(500),
})

type FormValues = z.infer<typeof createMermaSchema>

export default function MermasPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

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
          Registrar merma
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

  const insumos = (insumosRes?.data as { id: string; nombre: string; sku?: string | null }[] | undefined) ?? []
  const uoms = uomRes?.data ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(createMermaSchema),
    defaultValues: { insumo_id: "", cantidad: undefined as unknown as number, unidad_id: "", motivo: "" },
  })

  async function onSubmit(values: FormValues) {
    const { data, error } = await createMerma.mutateAsync(values)
    if (error) {
      toast.error(error)
      return
    }
    if (data) {
      toast.success("Merma registrada")
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar merma</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="insumo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insumo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar insumo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {insumos.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.nombre}
                          {i.sku && (
                            <span className="ml-1 text-muted-foreground text-xs">({i.sku})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidad_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidad..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {uoms.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.simbolo} — {u.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la causa de la merma..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMerma.isPending}>
                {createMerma.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
