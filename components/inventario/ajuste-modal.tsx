"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAjusteManual } from "@/hooks/use-inventario"
import { useInsumos } from "@/hooks/use-insumos"
import type { InventarioItem } from "@/types/app.types"

const ajusteSchema = z.object({
  insumo_id: z.string().uuid("Insumo requerido"),
  cantidad_nueva: z.number().min(0, "Cantidad no puede ser negativa"),
  motivo: z.string().min(1, "Motivo requerido").max(500),
})

type AjusteFormData = z.infer<typeof ajusteSchema>

interface AjusteModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  inventario: InventarioItem[]
}

export function AjusteModal({
  open,
  onClose,
  cedisId,
  inventario,
}: AjusteModalProps) {
  const ajuste = useAjusteManual(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const insumos = insumosRes?.data ?? []

  const form = useForm<AjusteFormData>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: {
      insumo_id: "",
      cantidad_nueva: 0,
      motivo: "",
    },
  })

  const selectedInsumoId = form.watch("insumo_id")
  const currentItem = inventario.find((i) => i.insumo_id === selectedInsumoId)

  useEffect(() => {
    if (!open) {
      form.reset({ insumo_id: "", cantidad_nueva: 0, motivo: "" })
    }
  }, [open, form])

  async function onSubmit(values: AjusteFormData) {
    const res = await ajuste.mutateAsync(values)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Ajuste aplicado correctamente")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuste manual de stock</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="insumo_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Insumo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar insumo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {insumos.map((ins) => (
                        <SelectItem key={ins.id} value={ins.id}>
                          {ins.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cantidad_nueva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva cantidad</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  {currentItem != null && (
                    <FormDescription>
                      Stock actual:{" "}
                      <span className="font-mono font-medium">
                        {currentItem.stock_actual} {currentItem.unidad_simbolo}
                      </span>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe el motivo del ajuste..."
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={ajuste.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={ajuste.isPending}>
                {ajuste.isPending ? "Aplicando..." : "Aplicar ajuste"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
