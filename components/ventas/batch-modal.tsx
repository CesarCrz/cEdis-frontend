"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Search, PlusCircle, Trash2, CheckSquare, Square } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Checkbox } from "@/components/ui/checkbox"
import { batchTicketSchema, type BatchTicketFormData } from "@/lib/validations/ticket"
import { useBatchVenta } from "@/hooks/use-ventas"
import { useClientes } from "@/hooks/use-clientes"
import { useInsumos } from "@/hooks/use-insumos"
import { useUom } from "@/hooks/use-uom"
import { formatCurrency } from "@/lib/utils/format"
import type { Cliente } from "@/types/app.types"

interface BatchModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

type Step = 1 | 2 | 3

export function BatchModal({ open, onClose, cedisId }: BatchModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [clienteSearch, setClienteSearch] = useState("")
  const [selectedClientes, setSelectedClientes] = useState<string[]>([])

  const batchVenta = useBatchVenta(cedisId)
  const { data: clientesRes } = useClientes(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const { data: uomRes } = useUom()

  const clientes = clientesRes?.data ?? []
  const insumos = insumosRes?.data ?? []
  const unidades = uomRes?.data ?? []

  const filteredClientes = clientes.filter(
    (c: Cliente) =>
      c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(clienteSearch.toLowerCase())
  )

  const form = useForm<BatchTicketFormData>({
    resolver: zodResolver(batchTicketSchema),
    defaultValues: {
      cliente_ids: [],
      items: [{ insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = form.watch("items")
  const totalPorTicket = watchedItems.reduce(
    (sum, item) => sum + (item.cantidad || 0) * (item.precio_unitario || 0),
    0
  )

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelectedClientes([])
      setClienteSearch("")
      form.reset({
        cliente_ids: [],
        items: [
          { insumo_id: "", cantidad: 0, unidad_id: "", precio_unitario: 0 },
        ],
      })
    }
  }, [open, form])

  function toggleCliente(id: string) {
    setSelectedClientes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function handleNext() {
    if (step === 1) {
      if (selectedClientes.length === 0) {
        toast.error("Selecciona al menos un cliente")
        return
      }
      form.setValue("cliente_ids", selectedClientes)
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  async function onSubmit(values: BatchTicketFormData) {
    const res = await batchVenta.mutateAsync({
      cliente_ids: values.cliente_ids,
      items: values.items,
    })
    if (res.error) {
      toast.error(res.error)
      return
    }
    const data = res.data
    toast.success(
      `${data?.created ?? selectedClientes.length} tickets creados correctamente`
    )
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Distribucion masiva — Paso {step} de 3
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selecciona los clientes que recibiran este pedido.
                </p>
                <div className="relative">
                  <Search
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    placeholder="Buscar cliente..."
                    value={clienteSearch}
                    onChange={(e) => setClienteSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                  {filteredClientes.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      Sin resultados
                    </p>
                  ) : (
                    filteredClientes.map((cliente) => {
                      const checked = selectedClientes.includes(cliente.id)
                      return (
                        <label
                          key={cliente.id}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCliente(cliente.id)}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {cliente.nombre}
                            </p>
                            {cliente.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {cliente.email}
                              </p>
                            )}
                          </div>
                          {checked ? (
                            <CheckSquare
                              className="h-4 w-4 text-primary ml-auto shrink-0"
                              aria-hidden
                            />
                          ) : (
                            <Square
                              className="h-4 w-4 text-muted-foreground/40 ml-auto shrink-0"
                              aria-hidden
                            />
                          )}
                        </label>
                      )
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedClientes.length} cliente(s) seleccionado(s)
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Define los items que se incluiran en cada ticket.
                </p>

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
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                  <p className="text-sm font-medium">Resumen</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Clientes:</span>
                    <span className="font-medium">
                      {selectedClientes.length}
                    </span>
                    <span className="text-muted-foreground">Items por ticket:</span>
                    <span className="font-medium">{fields.length}</span>
                    <span className="text-muted-foreground">Total por ticket:</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(totalPorTicket)}
                    </span>
                    <span className="text-muted-foreground">
                      Se crearan:
                    </span>
                    <span className="font-medium text-primary">
                      {selectedClientes.length} tickets
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <DialogFooter className="gap-2">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => (s - 1) as Step)}
                  disabled={batchVenta.isPending}
                >
                  Atras
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={batchVenta.isPending}
              >
                Cancelar
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={batchVenta.isPending}
                >
                  {batchVenta.isPending
                    ? "Creando..."
                    : `Crear ${selectedClientes.length} tickets`}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
