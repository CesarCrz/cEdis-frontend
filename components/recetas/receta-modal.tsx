"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle, Trash2, Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
import { UnitSelector } from "@/components/common/unit-selector"
import { RecetaCostoDisplay } from "@/components/recetas/receta-costo-display"
import { recetaSchema, type RecetaFormData } from "@/lib/validations/receta"
import { useCreateReceta, useUpdateReceta } from "@/hooks/use-recetas"
import { useInsumos } from "@/hooks/use-insumos"
import { formatCurrency } from "@/lib/utils/format"
import { UNITS, type UnitTipo } from "@/lib/utils/unit-conversion"
import { cn } from "@/lib/utils"
import type { Receta, Insumo } from "@/types/app.types"

interface RecetaModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  receta?: Receta
}

export function RecetaModal({
  open,
  onClose,
  cedisId,
  receta,
}: RecetaModalProps) {
  const isEdit = !!receta
  const [insumoSearchOpen, setInsumoSearchOpen] = useState<number | null>(null)

  const createReceta = useCreateReceta(cedisId)
  const updateReceta = useUpdateReceta(cedisId)
  const { data: insumosRes } = useInsumos(cedisId)
  const insumos: Insumo[] = insumosRes?.data ?? []

  const form = useForm<RecetaFormData>({
    resolver: zodResolver(recetaSchema),
    defaultValues: {
      nombre: "",
      ingredientes: [{ insumo_id: "", cantidad: 0, unidad_id: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredientes",
  })

  useEffect(() => {
    if (open && receta) {
      form.reset({
        nombre: receta.nombre,
        ingredientes:
          receta.ingredientes && receta.ingredientes.length > 0
            ? receta.ingredientes.map((ing) => ({
                insumo_id: ing.insumo_id,
                cantidad: ing.cantidad,
                unidad_id: ing.unidad_id ?? ing.unidad,
              }))
            : [{ insumo_id: "", cantidad: 0, unidad_id: "" }],
      })
    } else if (open && !receta) {
      form.reset({
        nombre: "",
        ingredientes: [{ insumo_id: "", cantidad: 0, unidad_id: "" }],
      })
    }
  }, [open, receta, form])

  const watchedIngredientes = form.watch("ingredientes")

  const costoTotal = useMemo(() => {
    return watchedIngredientes.reduce((acc, ing) => {
      const insumo = insumos.find((i) => i.id === ing.insumo_id)
      if (!insumo || !ing.cantidad || !ing.unidad_id) return acc
      const costo = insumo.costo_unitario ?? insumo.precio_unitario ?? 0
      const insumoUnit = UNITS[insumo.unidad_id ?? insumo.unidad_medida]
      const recipeUnit = UNITS[ing.unidad_id]
      if (!insumoUnit || !recipeUnit || insumoUnit.tipo !== recipeUnit.tipo) {
        return acc + ing.cantidad * costo
      }
      const cantidadEnBase = ing.cantidad * recipeUnit.toBase
      const cantidadEnUnidadInsumo = cantidadEnBase / insumoUnit.toBase
      return acc + cantidadEnUnidadInsumo * costo
    }, 0)
  }, [watchedIngredientes, insumos])

  function getInsumoTipo(insumoId: string): UnitTipo | undefined {
    const insumo = insumos.find((i) => i.id === insumoId)
    if (!insumo) return undefined
    const unitSymbol = insumo.unidad_id ?? insumo.unidad_medida
    return UNITS[unitSymbol]?.tipo
  }

  function getConversionNote(
    insumoId: string,
    recipeUnitId: string
  ): string | null {
    const insumo = insumos.find((i) => i.id === insumoId)
    if (!insumo || !recipeUnitId) return null
    const insumoUnitSymbol = insumo.unidad_id ?? insumo.unidad_medida
    if (insumoUnitSymbol === recipeUnitId) return null
    const insumoUnit = UNITS[insumoUnitSymbol]
    const recipeUnit = UNITS[recipeUnitId]
    if (!insumoUnit || !recipeUnit || insumoUnit.tipo !== recipeUnit.tipo)
      return null
    const factor = recipeUnit.toBase / insumoUnit.toBase
    if (factor === 1) return null
    return `1 ${recipeUnit.symbol} = ${factor < 1 ? factor : factor.toLocaleString("es-MX")} ${insumoUnit.symbol} del insumo`
  }

  async function onSubmit(values: RecetaFormData) {
    if (isEdit) {
      const res = await updateReceta.mutateAsync({
        id: receta.id,
        data: values,
      })
      if (res.error) {
        toast.error("Error al actualizar receta")
        return
      }
      toast.success("Receta actualizada exitosamente")
    } else {
      const res = await createReceta.mutateAsync(values)
      if (res.error) {
        toast.error("Error al crear receta")
        return
      }
      toast.success("Receta creada exitosamente")
    }
    onClose()
  }

  const isPending = createReceta.isPending || updateReceta.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar receta" : "Nueva receta"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form
              id="receta-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 pb-2"
            >
              {/* Nombre */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="receta-nombre">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        id="receta-nombre"
                        placeholder="Nombre de la receta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ingredientes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold">Ingredientes</p>
                  {form.formState.errors.ingredientes?.root && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.ingredientes.root.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => {
                    const insumoId = watchedIngredientes[index]?.insumo_id
                    const selectedInsumo = insumos.find(
                      (i) => i.id === insumoId
                    )
                    const ingredientTipo = getInsumoTipo(insumoId)
                    const unitId = watchedIngredientes[index]?.unidad_id
                    const conversionNote = getConversionNote(insumoId, unitId)

                    // Calculate partial cost for this ingredient
                    let costoParcial = 0
                    if (selectedInsumo && watchedIngredientes[index]?.cantidad && unitId) {
                      const costo =
                        selectedInsumo.costo_unitario ??
                        selectedInsumo.precio_unitario ??
                        0
                      const insumoUnit =
                        UNITS[selectedInsumo.unidad_id ?? selectedInsumo.unidad_medida]
                      const recipeUnit = UNITS[unitId]
                      if (
                        insumoUnit &&
                        recipeUnit &&
                        insumoUnit.tipo === recipeUnit.tipo
                      ) {
                        const cantBase =
                          watchedIngredientes[index].cantidad * recipeUnit.toBase
                        costoParcial = (cantBase / insumoUnit.toBase) * costo
                      } else {
                        costoParcial = watchedIngredientes[index].cantidad * costo
                      }
                    }

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_80px_100px_80px_32px] gap-2 items-start"
                      >
                        {/* Insumo combobox */}
                        <FormField
                          control={form.control}
                          name={`ingredientes.${index}.insumo_id`}
                          render={({ field: f }) => (
                            <FormItem>
                              {index === 0 && (
                                <FormLabel className="text-xs text-muted-foreground">
                                  Insumo
                                </FormLabel>
                              )}
                              <Popover
                                open={insumoSearchOpen === index}
                                onOpenChange={(o) =>
                                  setInsumoSearchOpen(o ? index : null)
                                }
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={insumoSearchOpen === index}
                                      aria-label="Seleccionar insumo"
                                      className={cn(
                                        "w-full justify-start font-normal text-sm h-9",
                                        !f.value && "text-muted-foreground"
                                      )}
                                    >
                                      <Search
                                        className="h-3.5 w-3.5 mr-1.5 shrink-0"
                                        aria-hidden
                                      />
                                      <span className="truncate">
                                        {selectedInsumo
                                          ? selectedInsumo.nombre
                                          : "Buscar insumo..."}
                                      </span>
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-[300px] p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput placeholder="Nombre o SKU..." />
                                    <CommandList>
                                      <CommandEmpty>
                                        Sin resultados
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {insumos.map((ins) => (
                                          <CommandItem
                                            key={ins.id}
                                            value={`${ins.nombre} ${ins.sku ?? ""}`}
                                            onSelect={() => {
                                              f.onChange(ins.id)
                                              // Auto-set unit to insumo's unit
                                              const unitSymbol =
                                                ins.unidad_id ??
                                                ins.unidad_medida
                                              form.setValue(
                                                `ingredientes.${index}.unidad_id`,
                                                unitSymbol
                                              )
                                              setInsumoSearchOpen(null)
                                            }}
                                          >
                                            <span className="font-medium">
                                              {ins.nombre}
                                            </span>
                                            {ins.sku && (
                                              <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                {ins.sku}
                                              </span>
                                            )}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Cantidad */}
                        <FormField
                          control={form.control}
                          name={`ingredientes.${index}.cantidad`}
                          render={({ field: f }) => (
                            <FormItem>
                              {index === 0 && (
                                <FormLabel className="text-xs text-muted-foreground">
                                  Cantidad
                                </FormLabel>
                              )}
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="any"
                                  className="font-mono h-9 text-sm"
                                  aria-label="Cantidad"
                                  {...f}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Unidad */}
                        <FormField
                          control={form.control}
                          name={`ingredientes.${index}.unidad_id`}
                          render={({ field: f }) => (
                            <FormItem>
                              {index === 0 && (
                                <FormLabel className="text-xs text-muted-foreground">
                                  Unidad
                                </FormLabel>
                              )}
                              <FormControl>
                                <UnitSelector
                                  value={f.value}
                                  onChange={f.onChange}
                                  tipo={ingredientTipo}
                                  disabled={!insumoId}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Costo parcial */}
                        <div>
                          {index === 0 && (
                            <p className="text-xs text-muted-foreground mb-2 leading-none">
                              Costo
                            </p>
                          )}
                          <div className="h-9 flex items-center">
                            <span className="font-mono text-xs text-muted-foreground">
                              {costoParcial > 0
                                ? formatCurrency(costoParcial)
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {/* Remove */}
                        <div>
                          {index === 0 && (
                            <div className="mb-2 h-4" aria-hidden />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                            aria-label={`Eliminar ingrediente ${index + 1}`}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>

                        {/* Conversion note */}
                        {conversionNote && (
                          <p className="col-span-5 text-xs text-muted-foreground -mt-2 pl-1">
                            {conversionNote}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    append({ insumo_id: "", cantidad: 0, unidad_id: "" })
                  }
                >
                  <PlusCircle className="h-4 w-4 mr-2" aria-hidden />
                  Agregar ingrediente
                </Button>
              </div>

              {/* Costo total */}
              <div className="rounded-md bg-muted/40 border border-border p-4">
                <RecetaCostoDisplay costo={costoTotal} />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            type="button"
          >
            Cancelar
          </Button>
          <Button form="receta-form" type="submit" disabled={isPending}>
            {isPending
              ? isEdit
                ? "Guardando..."
                : "Creando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear receta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
