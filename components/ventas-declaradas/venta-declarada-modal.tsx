"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle, Trash2 } from "lucide-react"

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
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  createVentaDeclaradaSchema,
  type CreateVentaDeclaradaFormData,
} from "@/lib/validations/venta-declarada"
import { useCreateVentaDeclarada } from "@/hooks/use-ventas-declaradas"
import { useClientes } from "@/hooks/use-clientes"
import { useCanales } from "@/hooks/use-canales"
import { useRecetas } from "@/hooks/use-recetas"

interface VentaDeclaradaModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

export function VentaDeclaradaModal({
  open,
  onClose,
  cedisId,
}: VentaDeclaradaModalProps) {
  const createVentaDeclarada = useCreateVentaDeclarada(cedisId)
  const { data: clientesRes } = useClientes(cedisId)
  const { data: canalesRes } = useCanales(cedisId)
  const { data: recetasRes } = useRecetas(cedisId)

  const clientes = clientesRes?.data ?? []
  const canales = canalesRes?.data ?? []
  const recetas = recetasRes?.data ?? []

  const form = useForm<CreateVentaDeclaradaFormData>({
    resolver: zodResolver(createVentaDeclaradaSchema),
    defaultValues: {
      cliente_id: "",
      canal_id: "",
      periodo_inicio: "",
      periodo_fin: "",
      notas: "",
      items: [{ receta_id: "", variacion_id: null, cantidad_vendida: 0 }],
    },
  })

  const [openRecetaIdx, setOpenRecetaIdx] = useState<number | null>(null)

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  function appendReceta() {
    const nextIdx = fields.length
    append({ receta_id: "", variacion_id: null, cantidad_vendida: 0 })
    setOpenRecetaIdx(nextIdx)
  }

  useEffect(() => {
    if (!open) {
      form.reset({
        cliente_id: "",
        canal_id: "",
        periodo_inicio: "",
        periodo_fin: "",
        notas: "",
        items: [{ receta_id: "", variacion_id: null, cantidad_vendida: 0 }],
      })
      setOpenRecetaIdx(null)
    }
  }, [open, form])

  async function onSubmit(values: CreateVentaDeclaradaFormData) {
    const res = await createVentaDeclarada.mutateAsync(values)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Venta declarada registrada")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva declaracion de venta</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombre}
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
                name="canal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal de venta</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar canal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {canales.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombre}
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
                name="periodo_inicio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodo_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Observaciones..."
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Platillos / Recetas</p>

              {fields.map((field, index) => {
                const selectedRecetaId = form.watch(`items.${index}.receta_id`)
                const receta = recetas.find((r) => r.id === selectedRecetaId)

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_120px_80px_36px] gap-2 items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.receta_id`}
                      render={({ field: f }) => (
                        <FormItem>
                          {index === 0 && (
                            <FormLabel className="text-xs">Receta</FormLabel>
                          )}
                          <Select
                            value={f.value}
                            onValueChange={(v) => { f.onChange(v); setOpenRecetaIdx(null) }}
                            open={openRecetaIdx === index}
                            onOpenChange={(o) => setOpenRecetaIdx(o ? index : null)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar receta..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recetas.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.nombre}
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
                      name={`items.${index}.variacion_id`}
                      render={({ field: f }) => (
                        <FormItem>
                          {index === 0 && (
                            <FormLabel className="text-xs">
                              Variacion
                            </FormLabel>
                          )}
                          <Select
                            value={f.value ?? "__none__"}
                            onValueChange={(v) =>
                              f.onChange(v === "__none__" ? null : v)
                            }
                            disabled={!receta}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="N/A" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="__none__">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.cantidad_vendida`}
                      render={({ field: f }) => (
                        <FormItem>
                          {index === 0 && (
                            <FormLabel className="text-xs">Cant.</FormLabel>
                          )}
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              placeholder="0"
                              value={f.value || ""}
                              onChange={(e) =>
                                f.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className={index === 0 ? "pt-6" : "pt-0"}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        aria-label="Eliminar item"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={appendReceta}
                className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <PlusCircle className="h-4 w-4" aria-hidden />
                Agregar platillo
              </button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createVentaDeclarada.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createVentaDeclarada.isPending}>
                {createVentaDeclarada.isPending
                  ? "Guardando..."
                  : "Registrar declaracion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
