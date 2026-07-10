"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
} from "@/components/ui/form"
import {
  proveedorSchema,
  type ProveedorFormData,
} from "@/lib/validations/proveedor"
import {
  useCreateProveedor,
  useUpdateProveedor,
} from "@/hooks/use-proveedores"
import type { Proveedor } from "@/types/app.types"

interface ProveedorModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  proveedor?: Proveedor
}

export function ProveedorModal({
  open,
  onClose,
  cedisId,
  proveedor,
}: ProveedorModalProps) {
  const isEdit = !!proveedor
  const createProveedor = useCreateProveedor(cedisId)
  const updateProveedor = useUpdateProveedor(cedisId)

  const form = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: { nombre: "", telefono: "", email: "", notas: "" },
  })

  useEffect(() => {
    if (open && proveedor) {
      form.reset({
        nombre: proveedor.nombre,
        telefono: proveedor.telefono ?? "",
        email: proveedor.email ?? "",
        notas: "",
      })
    } else if (open && !proveedor) {
      form.reset({ nombre: "", telefono: "", email: "", notas: "" })
    }
  }, [open, proveedor, form])

  async function onSubmit(values: ProveedorFormData) {
    const payload = {
      nombre: values.nombre,
      telefono: values.telefono || undefined,
      email: values.email || undefined,
      notas: values.notas || undefined,
    }

    if (isEdit) {
      const res = await updateProveedor.mutateAsync({
        id: proveedor.id,
        data: payload,
      })
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Proveedor actualizado exitosamente")
    } else {
      const res = await createProveedor.mutateAsync(payload)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Proveedor creado exitosamente")
    }
    onClose()
  }

  const isPending = createProveedor.isPending || updateProveedor.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar proveedor" : "Nuevo proveedor"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="proveedor-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="prov-nombre">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      id="prov-nombre"
                      placeholder="Nombre del proveedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="prov-telefono">Telefono</FormLabel>
                  <FormControl>
                    <Input
                      id="prov-telefono"
                      type="tel"
                      placeholder="555-123-4567"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="prov-email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="prov-email"
                      type="email"
                      placeholder="proveedor@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="prov-notas">Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      id="prov-notas"
                      placeholder="Notas adicionales..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            type="button"
          >
            Cancelar
          </Button>
          <Button form="proveedor-form" type="submit" disabled={isPending}>
            {isPending
              ? isEdit
                ? "Guardando..."
                : "Creando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear proveedor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
