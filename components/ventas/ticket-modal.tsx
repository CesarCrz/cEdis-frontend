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
  createTicketSchema,
  type CreateTicketFormData,
} from "@/lib/validations/ticket"
import { useCreateVenta } from "@/hooks/use-ventas"
import { useClientes } from "@/hooks/use-clientes"
import { useInsumos } from "@/hooks/use-insumos"
import { useUom } from "@/hooks/use-uom"
import { formatCurrency } from "@/lib/utils/format"

interface TicketModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

export function TicketModal({ open, onClose, cedisId }: TicketModalProps) {
  const createVenta = useCreateVenta(cedisId)
  const { data: clientesRes } = useClientes(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const { data: uomRes } = useUom()

  const clientes = clientesRes?.data ?? []
  const insumos = insumosRes?.data ?? []
  const unidades = uomRes?.data ?? []

  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      cliente_id: "",
      notas: "",
      items: [
        { insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const total = watchedItems.reduce(
    (sum, item) => sum + (item.cantidad || 0) * (item.precio_unitario || 0),
    0
  )

  useEffect(() => {
    if (!open) {
      form.reset({
        cliente_id: "",
        notas: "",
        items: [
          { insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 },
        ],
      })
    }
  }, [open, form])

  async function onSubmit(values: CreateTicketFormData) {
    const res = await createVenta.mutateAsync(values)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success("Ticket creado correctamente")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo ticket</DialogTitle>
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
                      precio_unitario: 0,
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
                    name={`items.${index}.precio_unitario`}
                    render={({ field: f }) => (
                      <FormItem>
                        {index === 0 && (
                          <FormLabel className="text-xs">Precio</FormLabel>
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
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold font-mono">
                {formatCurrency(total)}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createVenta.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createVenta.isPending}>
                {createVenta.isPending ? "Guardando..." : "Crear ticket"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
