"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInviteUsuario } from "@/hooks/use-usuarios"
import { ROLE_LABELS } from "@/lib/constants"
import type { Role } from "@/lib/constants"

const inviteSchema = z.object({
  email: z.string().email("Email invalido"),
  role: z.enum(["admin", "viewer"] as const),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteModalProps {
  open: boolean
  onClose: () => void
  cedisId: string
}

export function InviteModal({ open, onClose, cedisId }: InviteModalProps) {
  const invite = useInviteUsuario(cedisId)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "viewer" },
  })

  useEffect(() => {
    if (!open) form.reset({ email: "", role: "viewer" })
  }, [open, form])

  async function onSubmit(values: InviteFormData) {
    const res = await invite.mutateAsync({
      email: values.email,
      role: values.role as Role,
    })
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success(`Invitacion enviada a ${values.email}`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">
                        {ROLE_LABELS["admin"]}
                      </SelectItem>
                      <SelectItem value="viewer">
                        {ROLE_LABELS["viewer"]}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={invite.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={invite.isPending}>
                {invite.isPending ? "Enviando..." : "Enviar invitacion"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
