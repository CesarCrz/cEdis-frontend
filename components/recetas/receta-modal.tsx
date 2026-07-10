"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle, Trash2, Search, ChevronDown, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UnitSelector } from "@/components/common/unit-selector"
import { NumericInput } from "@/components/ui/numeric-input"
import { recetaSchema, type RecetaFormData } from "@/lib/validations/receta"
import { useCreateReceta, useUpdateReceta, useReceta } from "@/hooks/use-recetas"
import { useInsumos } from "@/hooks/use-insumos"
import { useRecetas } from "@/hooks/use-recetas"
import { useRecetaCategorias, useCreateRecetaCategoria } from "@/hooks/use-receta-categorias"
import { cn } from "@/lib/utils"
import type { Receta, Insumo } from "@/types/app.types"

interface RecetaModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  receta?: Receta
}

const EMPTY_ING = { tipo: "insumo" as const, insumo_id: null, sub_receta_id: null, cantidad: 0, unidad_id: "" }

export function RecetaModal({ open, onClose, cedisId, receta }: RecetaModalProps) {
  const isEdit = !!receta
  const [searchOpen, setSearchOpen] = useState<number | null>(null)
  const [newCatName, setNewCatName] = useState("")

  const createReceta = useCreateReceta(cedisId)
  const updateReceta = useUpdateReceta(cedisId)
  const createCat = useCreateRecetaCategoria(cedisId)

  const { data: insumosRes } = useInsumos(cedisId, { pageSize: 1000 })
  const { data: recetasRes } = useRecetas(cedisId)
  const { data: catRes } = useRecetaCategorias(cedisId)

  // Fetch full receta detail when editing (list doesn't include ingredientes)
  const { data: fullRes, isLoading: loadingFull } = useReceta(cedisId, receta?.id ?? "")
  const fullReceta = fullRes?.data

  const insumos: Insumo[] = insumosRes?.data ?? []
  const recetasDisponibles: Receta[] = (recetasRes?.data ?? []).filter((r) => r.id !== receta?.id)
  const categorias = catRes?.data ?? []

  const form = useForm<RecetaFormData>({
    resolver: zodResolver(recetaSchema),
    defaultValues: {
      nombre: "",
      categoria_id: null,
      rendimiento: 1,
      rendimiento_unidad_id: null,
      ingredientes: [EMPTY_ING],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "ingredientes" })

  useEffect(() => {
    if (!open) return
    if (!isEdit) {
      form.reset({ nombre: "", categoria_id: null, rendimiento: 1, rendimiento_unidad_id: null, ingredientes: [EMPTY_ING] })
      return
    }
    // Immediately populate known fields from list item (has rendimiento_unidad_id, categoria_id, etc.)
    // Then overwrite with full detail once loaded (adds ingredientes)
    const source = fullReceta ?? receta
    if (!source) return
    form.reset({
      nombre: source.nombre,
      categoria_id: source.categoria_id ?? null,
      rendimiento: source.rendimiento ?? 1,
      rendimiento_unidad_id: source.rendimiento_unidad_id ?? null,
      ingredientes: fullReceta?.ingredientes?.length
        ? fullReceta.ingredientes.map((ing) => ({
            tipo: ing.sub_receta_id ? "sub_receta" as const : "insumo" as const,
            insumo_id: ing.insumo_id ?? null,
            sub_receta_id: ing.sub_receta_id ?? null,
            cantidad: ing.cantidad,
            unidad_id: ing.unidad_id ?? "",
          }))
        : [EMPTY_ING],
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, receta?.id, fullReceta?.id])

  const watchedIngredientes = form.watch("ingredientes")
  const hasSubReceta = watchedIngredientes.some((i) => i.tipo === "sub_receta")

  async function handleCreateCat() {
    if (!newCatName.trim()) return
    const res = await createCat.mutateAsync(newCatName.trim())
    if (res.data) {
      form.setValue("categoria_id", res.data.id)
      setNewCatName("")
      toast.success("Categoría creada")
    }
  }

  async function onSubmit(values: RecetaFormData) {
    const payload = {
      nombre: values.nombre,
      categoria_id: values.categoria_id ?? null,
      rendimiento: values.rendimiento,
      rendimiento_unidad_id: values.rendimiento_unidad_id ?? null,
      ingredientes: values.ingredientes.map((ing) => ({
        insumo_id: ing.tipo === "insumo" ? ing.insumo_id : null,
        sub_receta_id: ing.tipo === "sub_receta" ? ing.sub_receta_id : null,
        cantidad: ing.cantidad,
        unidad_id: ing.unidad_id,
      })),
    }

    if (isEdit) {
      const res = await updateReceta.mutateAsync({ id: receta.id, data: payload })
      if (res.error) { toast.error(res.error); return }
      toast.success("Receta actualizada")
    } else {
      const res = await createReceta.mutateAsync(payload)
      if (res.error) { toast.error(res.error); return }
      toast.success("Receta creada")
    }
    onClose()
  }

  const isPending = createReceta.isPending || updateReceta.isPending
  const showLoader = isEdit && loadingFull && !fullReceta

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>{isEdit ? "Editar receta" : "Nueva receta"}</DialogTitle>
        </DialogHeader>

        {showLoader ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="pr-4 pl-1">
              <Form {...form}>
                <form id="receta-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-2">

                  {/* Nombre + Categoria */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de la receta" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoria_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn("w-full justify-between font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {categorias.find((c) => c.id === field.value)?.nombre ?? "Sin categoría"}
                                  <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[220px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Buscar..." />
                                <CommandList>
                                  <CommandEmpty>Sin resultados</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem value="__none__" onSelect={() => field.onChange(null)}>
                                      <span className="text-muted-foreground">Sin categoría</span>
                                    </CommandItem>
                                    {categorias.map((cat) => (
                                      <CommandItem key={cat.id} value={cat.nombre} onSelect={() => field.onChange(cat.id)}>
                                        {cat.nombre}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                                <div className="border-t p-2 flex gap-1">
                                  <Input
                                    placeholder="Nueva categoría..."
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCat())}
                                    className="h-7 text-xs"
                                  />
                                  <Button type="button" size="sm" className="h-7 px-2 text-xs" onClick={handleCreateCat} disabled={!newCatName.trim() || createCat.isPending}>
                                    +
                                  </Button>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Rendimiento */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="rendimiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendimiento</FormLabel>
                          <FormControl>
                            <NumericInput value={field.value} onChange={field.onChange} decimals={3} placeholder="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rendimiento_unidad_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad de rendimiento</FormLabel>
                          <FormControl>
                            <UnitSelector value={field.value ?? ""} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Ingredientes */}
                  <div>
                    <p className="text-sm font-semibold mb-3">Ingredientes</p>
                    <div className="space-y-2">
                      {fields.map((field, index) => {
                        const ing = watchedIngredientes[index]
                        const isSubReceta = ing?.tipo === "sub_receta"
                        const selectedInsumo = insumos.find((i) => i.id === ing?.insumo_id)
                        const selectedSubReceta = recetasDisponibles.find((r) => r.id === ing?.sub_receta_id)

                        return (
                          <div key={field.id} className="grid grid-cols-[110px_1fr_80px_100px_32px] gap-2 items-end">
                            {/* Tipo */}
                            <div>
                              {index === 0 && <p className="text-xs text-muted-foreground mb-1.5">Tipo</p>}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button type="button" variant="outline" size="sm" className="w-full h-9 text-xs justify-between">
                                    {isSubReceta ? "Sub-receta" : "Insumo"}
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onSelect={() => { form.setValue(`ingredientes.${index}.tipo`, "insumo"); form.setValue(`ingredientes.${index}.sub_receta_id`, null); form.setValue(`ingredientes.${index}.insumo_id`, null); form.setValue(`ingredientes.${index}.unidad_id`, "") }}>Insumo</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => { form.setValue(`ingredientes.${index}.tipo`, "sub_receta"); form.setValue(`ingredientes.${index}.insumo_id`, null); form.setValue(`ingredientes.${index}.sub_receta_id`, null); form.setValue(`ingredientes.${index}.unidad_id`, "") }}>Sub-receta</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Selector */}
                            <div>
                              {index === 0 && <p className="text-xs text-muted-foreground mb-1.5">{isSubReceta ? "Sub-receta" : "Insumo"}</p>}
                              <Popover open={searchOpen === index} onOpenChange={(o) => setSearchOpen(o ? index : null)}>
                                <PopoverTrigger asChild>
                                  <Button type="button" variant="outline" role="combobox" className={cn("w-full h-9 justify-start font-normal text-sm", !selectedInsumo && !selectedSubReceta && "text-muted-foreground")}>
                                    <Search className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                                    <span className="truncate">
                                      {isSubReceta ? (selectedSubReceta?.nombre ?? "Buscar receta...") : (selectedInsumo?.nombre ?? "Buscar insumo...")}
                                    </span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[260px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Buscar..." />
                                    <CommandList>
                                      <CommandEmpty>Sin resultados</CommandEmpty>
                                      <CommandGroup>
                                        {isSubReceta
                                          ? recetasDisponibles.map((r) => (
                                              <CommandItem key={r.id} value={r.nombre} onSelect={() => { form.setValue(`ingredientes.${index}.sub_receta_id`, r.id); if (r.rendimiento_unidad_id) form.setValue(`ingredientes.${index}.unidad_id`, r.rendimiento_unidad_id); setSearchOpen(null) }}>
                                                {r.nombre}
                                              </CommandItem>
                                            ))
                                          : insumos.map((ins) => (
                                              <CommandItem key={ins.id} value={`${ins.nombre} ${ins.sku ?? ""}`} onSelect={() => { form.setValue(`ingredientes.${index}.insumo_id`, ins.id); if (ins.unidad_id) form.setValue(`ingredientes.${index}.unidad_id`, ins.unidad_id); setSearchOpen(null) }}>
                                                <span className="font-medium">{ins.nombre}</span>
                                                {ins.sku && <span className="ml-2 font-mono text-xs text-muted-foreground">{ins.sku}</span>}
                                              </CommandItem>
                                            ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              {form.formState.errors.ingredientes?.[index] && (
                                <p className="text-xs text-destructive mt-1">{form.formState.errors.ingredientes[index]?.message}</p>
                              )}
                            </div>

                            {/* Cantidad */}
                            <FormField
                              control={form.control}
                              name={`ingredientes.${index}.cantidad`}
                              render={({ field: f }) => (
                                <FormItem className="space-y-0">
                                  {index === 0 && <FormLabel className="text-xs text-muted-foreground block mb-1.5">Cantidad</FormLabel>}
                                  <FormControl>
                                    <NumericInput value={f.value} onChange={f.onChange} decimals={3} placeholder="0" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {/* Unidad */}
                            <FormField
                              control={form.control}
                              name={`ingredientes.${index}.unidad_id`}
                              render={({ field: f }) => (
                                <FormItem className="space-y-0">
                                  {index === 0 && <FormLabel className="text-xs text-muted-foreground block mb-1.5">Unidad</FormLabel>}
                                  <FormControl>
                                    <UnitSelector value={f.value} onChange={f.onChange} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            {/* Remove */}
                            <div>
                              {index === 0 && <div className="mb-1.5 h-4" />}
                              <Button type="button" variant="ghost" size="sm" className="h-9 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => { const i = fields.length; append({ ...EMPTY_ING, tipo: "insumo" }); setSearchOpen(i) }}>
                        <PlusCircle className="h-4 w-4 mr-1.5" /> Insumo
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => { const i = fields.length; append({ ...EMPTY_ING, tipo: "sub_receta" }); setSearchOpen(i) }}>
                        <PlusCircle className="h-4 w-4 mr-1.5" /> Sub-receta
                      </Button>
                    </div>
                  </div>

                  {/* Costo */}
                  <div className="rounded-md bg-muted/40 border border-border p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Costo teórico</p>
                    {receta?.costo_teorico_base != null && Number(receta.costo_teorico_base) > 0 ? (
                      <p className="text-lg font-semibold font-mono mt-1">
                        {formatCurrency(Number(receta.costo_teorico_base))}
                        <span className="text-xs font-normal text-muted-foreground ml-2">por porción</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {hasSubReceta
                          ? "Calculado automáticamente al guardar (incluye sub-recetas)"
                          : "Calculado automáticamente al guardar"}
                      </p>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isPending} type="button">Cancelar</Button>
          <Button form="receta-form" type="submit" disabled={isPending || showLoader}>
            {isPending ? (isEdit ? "Guardando..." : "Creando...") : (isEdit ? "Guardar cambios" : "Crear receta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
