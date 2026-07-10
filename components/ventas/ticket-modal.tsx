"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle, Trash2, Search, ChevronDown } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { UnitSelector } from "@/components/common/unit-selector"
import {
  createTicketSchema,
  type CreateTicketFormData,
} from "@/lib/validations/ticket"
import { useCreateVenta } from "@/hooks/use-ventas"
import { useClientes } from "@/hooks/use-clientes"
import { useInsumos } from "@/hooks/use-insumos"
import { useUnidadesMedida } from "@/hooks/use-uom"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface TicketModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

export function TicketModal({ open, onClose, cedisId }: TicketModalProps) {
  const [searchOpen, setSearchOpen] = useState<number | null>(null)

  const createVenta = useCreateVenta(cedisId)
  const { data: clientesRes } = useClientes(cedisId)
  const { data: insumosRes } = useInsumos(cedisId, { pageSize: 1000 })
  const { data: uomRes } = useUnidadesMedida()

  const clientes = clientesRes?.data ?? []
  const insumos = insumosRes?.data ?? []
  const unidades = uomRes?.data ?? []

  function getPrecioAjustado(insumoId: string, targetUnitId: string): number {
    const ins = insumos.find((i) => i.id === insumoId)
    if (!ins || ins.costo_unitario == null) return 0
    const baseUnit = unidades.find((u) => u.id === ins.unidad_id)
    const targetUnit = unidades.find((u) => u.id === targetUnitId)
    if (!baseUnit || !targetUnit) return Number(ins.costo_unitario)
    return Number(ins.costo_unitario) * (Number(targetUnit.factor) / Number(baseUnit.factor))
  }

  function getInsumoUnitTipo(insumoId: string) {
    const ins = insumos.find((i) => i.id === insumoId)
    if (!ins) return undefined
    return unidades.find((u) => u.id === ins.unidad_id)?.tipo
  }

  const form = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      cliente_id: "",
      notas: "",
      items: [{ insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" })
  const watchedItems = form.watch("items")
  const total = watchedItems.reduce((sum, item) => sum + (item.cantidad || 0) * (item.precio_unitario || 0), 0)

  useEffect(() => {
    if (!open) {
      form.reset({
        cliente_id: "",
        notas: "",
        items: [{ insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 }],
      })
      setSearchOpen(null)
    }
  }, [open, form])

  async function onSubmit(values: CreateTicketFormData) {
    const res = await createVenta.mutateAsync(values)
    if (res.error) { toast.error(res.error); return }
    toast.success("Ticket creado correctamente")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Nuevo ticket de venta</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="pr-4 pl-1">
            <Form {...form}>
              <form id="ticket-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-2">

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cliente_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente (Sucursal)</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientes.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
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
                          <Textarea {...field} placeholder="Observaciones..." rows={2} className="resize-none" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Items</p>

                  {/* Header row */}
                  <div className="grid grid-cols-[1fr_80px_120px_120px_36px] gap-2">
                    <p className="text-xs text-muted-foreground">Insumo</p>
                    <p className="text-xs text-muted-foreground">Cant.</p>
                    <p className="text-xs text-muted-foreground">Unidad</p>
                    <p className="text-xs text-muted-foreground">Precio unit.</p>
                    <span />
                  </div>

                  {fields.map((field, index) => {
                    const selectedInsumo = insumos.find((i) => i.id === watchedItems[index]?.insumo_id)

                    return (
                      <div key={field.id} className="grid grid-cols-[1fr_80px_120px_120px_36px] gap-2 items-start">

                        {/* Insumo — searchable combobox */}
                        <div>
                          <Popover open={searchOpen === index} onOpenChange={(o) => setSearchOpen(o ? index : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                className={cn("w-full h-9 justify-start font-normal text-sm", !selectedInsumo && "text-muted-foreground")}
                              >
                                <Search className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                <span className="truncate">{selectedInsumo?.nombre ?? "Buscar insumo..."}</span>
                                <ChevronDown className="h-3.5 w-3.5 ml-auto shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-[280px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar insumo..." />
                                <CommandList>
                                  <CommandEmpty>Sin resultados</CommandEmpty>
                                  <CommandGroup>
                                    {insumos.map((ins) => (
                                      <CommandItem
                                        key={ins.id}
                                        value={`${ins.nombre} ${ins.sku ?? ""}`}
                                        onSelect={() => {
                                          form.setValue(`items.${index}.insumo_id`, ins.id)
                                          const unitId = ins.unidad_id ?? ""
                                          form.setValue(`items.${index}.unidad_id`, unitId)
                                          // precio en la unidad base del insumo (factor ratio = 1)
                                          form.setValue(`items.${index}.precio_unitario`, ins.costo_unitario != null ? Number(ins.costo_unitario) : 0)
                                          setSearchOpen(null)
                                        }}
                                      >
                                        <span className="font-medium">{ins.nombre}</span>
                                        {ins.sku && <span className="ml-2 font-mono text-xs text-muted-foreground">{ins.sku}</span>}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {selectedInsumo && (
                            <p className="text-xs mt-1 pl-0.5">
                              <span className="text-muted-foreground">CEDIS: </span>
                              <span className={cn("font-mono font-medium", selectedInsumo.stock_actual <= selectedInsumo.stock_minimo ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
                                {selectedInsumo.stock_actual} {unidades.find(u => u.id === selectedInsumo.unidad_id)?.simbolo ?? ""}
                              </span>
                            </p>
                          )}
                          {form.formState.errors.items?.[index]?.insumo_id && (
                            <p className="text-xs text-destructive mt-1">{form.formState.errors.items[index]?.insumo_id?.message}</p>
                          )}
                        </div>

                        {/* Cantidad */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.cantidad`}
                          render={({ field: f }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <Input type="number" min={0} step="any" placeholder="0" value={f.value || ""} onChange={(e) => f.onChange(e.target.valueAsNumber)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Unidad */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.unidad_id`}
                          render={({ field: f }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <UnitSelector
                                  value={f.value}
                                  tipo={getInsumoUnitTipo(watchedItems[index]?.insumo_id)}
                                  onChange={(newUnitId) => {
                                    f.onChange(newUnitId)
                                    const insumoId = watchedItems[index]?.insumo_id
                                    if (insumoId) {
                                      form.setValue(`items.${index}.precio_unitario`, getPrecioAjustado(insumoId, newUnitId))
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Precio unitario */}
                        <FormField
                          control={form.control}
                          name={`items.${index}.precio_unitario`}
                          render={({ field: f }) => (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                  <Input type="number" min={0} step="any" placeholder="0.00" className="pl-6" value={f.value || ""} onChange={(e) => f.onChange(e.target.valueAsNumber)} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Delete */}
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
                    )
                  })}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const newIndex = fields.length
                      append({ insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 })
                      setSearchOpen(newIndex)
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" aria-hidden />
                    Agregar item
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold font-mono">{formatCurrency(total)}</p>
                </div>
              </form>
            </Form>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-border shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={createVenta.isPending}>Cancelar</Button>
          <Button form="ticket-form" type="submit" disabled={createVenta.isPending}>
            {createVenta.isPending ? "Guardando..." : "Crear ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
