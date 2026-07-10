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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { clienteSchema, type ClienteFormData } from "@/lib/validations/cliente"
import { useCreateCliente, useUpdateCliente } from "@/hooks/use-clientes"
import type { Cliente } from "@/types/app.types"

interface ClienteModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
  cliente?: Cliente
}

export function ClienteModal({
  open,
  onClose,
  cedisId,
  cliente,
}: ClienteModalProps) {
  const isEdit = !!cliente
  const createCliente = useCreateCliente(cedisId)
  const updateCliente = useUpdateCliente(cedisId)

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre: "", telefono: "", email: "" },
  })

  useEffect(() => {
    if (open && cliente) {
      form.reset({
        nombre: cliente.nombre,
        telefono: cliente.telefono ?? "",
        email: cliente.email ?? "",
      })
    } else if (open && !cliente) {
      form.reset({ nombre: "", telefono: "", email: "" })
    }
  }, [open, cliente, form])

  async function onSubmit(values: ClienteFormData) {
    const payload = {
      nombre: values.nombre,
      telefono: values.telefono || undefined,
      email: values.email || undefined,
    }

    if (isEdit) {
      const res = await updateCliente.mutateAsync({
        id: cliente.id,
        data: payload,
      })
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Cliente actualizado exitosamente")
    } else {
      const res = await createCliente.mutateAsync(payload)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Cliente creado exitosamente")
    }
    onClose()
  }

  const isPending = createCliente.isPending || updateCliente.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="cliente-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="cliente-nombre">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      id="cliente-nombre"
                      placeholder="Nombre del cliente"
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
                  <FormLabel htmlFor="cliente-telefono">Telefono</FormLabel>
                  <FormControl>
                    <Input
                      id="cliente-telefono"
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
                  <FormLabel htmlFor="cliente-email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="cliente-email"
                      type="email"
                      placeholder="cliente@ejemplo.com"
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
          <Button form="cliente-form" type="submit" disabled={isPending}>
            {isPending
              ? isEdit
                ? "Guardando..."
                : "Creando..."
              : isEdit
              ? "Guardar cambios"
              : "Crear cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
