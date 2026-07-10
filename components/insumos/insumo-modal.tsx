"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { PlusCircle } from "lucide-react"

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
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UnitSelector } from "@/components/common/unit-selector"
import { NumericInput } from "@/components/ui/numeric-input"
import { insumoSchema, type InsumoFormData } from "@/lib/validations/insumo"
import { useCreateInsumo, useUpdateInsumo } from "@/hooks/use-insumos"
import { useCategorias, useCreateCategoria } from "@/hooks/use-categorias"
import { useProveedores } from "@/hooks/use-proveedores"
import type { Insumo } from "@/types/app.types"

interface InsumoModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  insumo?: Insumo
}

export function InsumoModal({
  open,
  onClose,
  cedisId,
  insumo,
}: InsumoModalProps) {
  const isEdit = !!insumo
  const [newCategoriaName, setNewCategoriaName] = useState("")
  const [showCategoriaInput, setShowCategoriaInput] = useState(false)

  const createInsumo = useCreateInsumo(cedisId)
  const updateInsumo = useUpdateInsumo(cedisId)
  const { data: categoriasRes } = useCategorias(cedisId)
  const { data: proveedoresRes } = useProveedores(cedisId)
  const createCategoria = useCreateCategoria(cedisId)

  const categorias = categoriasRes?.data ?? []
  const proveedores = proveedoresRes?.data ?? []

  const form = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: "",
      sku: "",
      categoria_id: null,
      unidad_id: "",
      costo_unitario: 0,
      stock_minimo: 0,
      stock_inicial: 0,
      proveedor_id: null,
    },
  })

  useEffect(() => {
    if (open && insumo) {
      form.reset({
        nombre: insumo.nombre,
        sku: insumo.sku ?? "",
        categoria_id: insumo.categoria_id ?? null,
        unidad_id: insumo.unidad_id ?? insumo.unidad_medida ?? "",
        costo_unitario: insumo.costo_unitario ?? insumo.precio_unitario ?? 0,
        stock_minimo: insumo.stock_minimo,
        stock_inicial: 0,
        proveedor_id: insumo.proveedor_id ?? null,
      })
    } else if (open && !insumo) {
      form.reset({
        nombre: "",
        sku: "",
        categoria_id: null,
        unidad_id: "",
        costo_unitario: 0,
        stock_minimo: 0,
        stock_inicial: 0,
        proveedor_id: null,
      })
    }
  }, [open, insumo, form])

  async function handleCreateCategoria() {
    if (!newCategoriaName.trim()) return
    const res = await createCategoria.mutateAsync(newCategoriaName.trim())
    if (res.data) {
      form.setValue("categoria_id", res.data.id)
      setNewCategoriaName("")
      setShowCategoriaInput(false)
      toast.success("Categoria creada")
    }
  }

  async function onSubmit(values: InsumoFormData) {
    const payload = isEdit
      ? {
          nombre: values.nombre,
          sku: values.sku || undefined,
          categoria_id: values.categoria_id || undefined,
          unidad_id: values.unidad_id,
          costo_unitario: values.costo_unitario,
          stock_minimo: values.stock_minimo,
          proveedor_id: values.proveedor_id || undefined,
        }
      : values

    if (isEdit) {
      const res = await updateInsumo.mutateAsync({
        id: insumo.id,
        data: payload,
      })
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Insumo actualizado exitosamente")
    } else {
      const res = await createInsumo.mutateAsync(payload)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Insumo creado exitosamente")
    }
    onClose()
  }

  const isPending = createInsumo.isPending || updateInsumo.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar insumo" : "Nuevo insumo"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
        <Form {...form}>
          <form
            id="insumo-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-2"
          >
            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-nombre">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      id="insumo-nombre"
                      placeholder="Nombre del insumo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SKU */}
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-sku">SKU</FormLabel>
                  <FormControl>
                    <Input
                      id="insumo-sku"
                      placeholder="Auto-generado si se deja vacio"
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-categoria">Categoria</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger id="insumo-categoria">
                        <SelectValue placeholder="Sin categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Sin categoria</SelectItem>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                      <div className="border-t mt-1 pt-1">
                        {showCategoriaInput ? (
                          <div className="flex gap-2 px-2 py-1">
                            <Input
                              placeholder="Nueva categoria"
                              value={newCategoriaName}
                              onChange={(e) =>
                                setNewCategoriaName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleCreateCategoria()
                                }
                              }}
                              className="h-7 text-sm"
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCreateCategoria}
                              disabled={createCategoria.isPending}
                            >
                              Crear
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors"
                            onClick={() => setShowCategoriaInput(true)}
                          >
                            <PlusCircle className="h-3.5 w-3.5" aria-hidden />
                            Crear categoria
                          </button>
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unidad de medida */}
            <FormField
              control={form.control}
              name="unidad_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-unidad">
                    Unidad de medida
                  </FormLabel>
                  <FormControl>
                    <UnitSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar unidad"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Costo unitario */}
            <FormField
              control={form.control}
              name="costo_unitario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-costo">Costo unitario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                        MXN $
                      </span>
                      <NumericInput
                        id="insumo-costo"
                        decimals={2}
                        className="pl-14"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock minimo */}
            <FormField
              control={form.control}
              name="stock_minimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-stock-min">
                    Stock minimo
                  </FormLabel>
                  <FormControl>
                    <NumericInput
                      id="insumo-stock-min"
                      decimals={3}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Alerta visual cuando el stock baje de este valor
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock inicial — solo en creacion */}
            {!isEdit && (
              <FormField
                control={form.control}
                name="stock_inicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="insumo-stock-ini">
                      Stock existente
                    </FormLabel>
                    <FormControl>
                      <NumericInput
                        id="insumo-stock-ini"
                        decimals={3}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Proveedor */}
            <FormField
              control={form.control}
              name="proveedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="insumo-proveedor">Proveedor</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) =>
                      field.onChange(v === "__none__" ? null : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger id="insumo-proveedor">
                        <SelectValue placeholder="Sin proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Sin proveedor</SelectItem>
                      {proveedores.map((prov) => (
                        <SelectItem key={prov.id} value={prov.id}>
                          {prov.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            form="insumo-form"
            type="submit"
            disabled={isPending}
          >
            {isPending
              ? isEdit
                ? "Guardando..."
                : "Creando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear insumo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
