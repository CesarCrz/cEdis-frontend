"use client"

import { useEffect } from "react"
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
  createEntradaSchema,
  type CreateEntradaFormData,
} from "@/lib/validations/entrada"
import { useCreateEntrada } from "@/hooks/use-entradas"
import { useInsumos } from "@/hooks/use-insumos"
import { useProveedores } from "@/hooks/use-proveedores"
import { useUom } from "@/hooks/use-uom"
import { formatCurrency } from "@/lib/utils/format"

interface EntradaModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

export function EntradaModal({ open, onClose, cedisId }: EntradaModalProps) {
  const createEntrada = useCreateEntrada(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const { data: proveedoresRes } = useProveedores(cedisId)
  const { data: uomRes } = useUom()

  const insumos = insumosRes?.data ?? []
  const proveedores = proveedoresRes?.data ?? []
  const unidades = uomRes?.data ?? []

  const form = useForm<CreateEntradaFormData>({
    resolver: zodResolver(createEntradaSchema),
    defaultValues: {
      proveedor_id: null,
      notas: "",
      items: [
        { insumo_id: "", cantidad: 0, unidad_id: "", costo_unitario: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const totalCosto = watchedItems.reduce(
    (sum, item) => sum + (item.cantidad || 0) * (item.costo_unitario || 0),
    0
  )

  useEffect(() => {
    if (!open) {
      form.reset({
        proveedor_id: null,
        notas: "",
        items: [
          { insumo_id: "", cantidad: 0, unidad_id: "", costo_unitario: 0 },
        ],
      })
    }
  }, [open, form])

  async function onSubmit(values: CreateEntradaFormData) {
    const res = await createEntrada.mutateAsync(values)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Entrada creada correctamente")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva entrada</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="proveedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor (opcional)</FormLabel>
                    <Select
                      value={field.value ?? "__none__"}
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? null : v)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin proveedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">Sin proveedor</SelectItem>
                        {proveedores.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre}
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
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      insumo_id: "",
                      cantidad: 0,
                      unidad_id: "",
                      costo_unitario: 0,
                    })
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" aria-hidden />
                  Agregar item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_80px_120px_120px_36px] gap-2 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`items.${index}.insumo_id`}
                    render={({ field: f }) => (
                      <FormItem>
                        {index === 0 && (
                          <FormLabel className="text-xs">Insumo</FormLabel>
                        )}
                        <Select value={f.value} onValueChange={f.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
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
                    name={`items.${index}.cantidad`}
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

                  <FormField
                    control={form.control}
                    name={`items.${index}.unidad_id`}
                    render={({ field: f }) => (
                      <FormItem>
                        {index === 0 && (
                          <FormLabel className="text-xs">Unidad</FormLabel>
                        )}
                        <Select value={f.value} onValueChange={f.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unidades.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.simbolo}
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
                    name={`items.${index}.costo_unitario`}
                    render={({ field: f }) => (
                      <FormItem>
                        {index === 0 && (
                          <FormLabel className="text-xs">
                            Costo unit.
                          </FormLabel>
                        )}
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                              $
                            </span>
                            <Input
                              type="number"
                              min={0}
                              step="any"
                              placeholder="0.00"
                              className="pl-6"
                              value={f.value || ""}
                              onChange={(e) =>
                                f.onChange(e.target.valueAsNumber)
                              }
                            />
                          </div>
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
              ))}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total estimado</p>
              <p className="text-lg font-semibold font-mono">
                {formatCurrency(totalCosto)}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createEntrada.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createEntrada.isPending}>
                {createEntrada.isPending ? "Guardando..." : "Crear entrada"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
