"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Warehouse, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Correo electronico invalido"),
})

type FormData = z.infer<typeof schema>

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [sentTo, setSentTo] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit({ email }: FormData) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.message ?? "Error al enviar el enlace")
      }

      setSentTo(email)
      setSent(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error de conexion")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
            <Warehouse className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            cEdis
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de gestion de centros de distribucion
          </p>
        </div>

        {/* Form or success */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                <Send className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Revisa tu correo
              </h2>
              <p className="text-sm text-muted-foreground">
                Enviamos un enlace de acceso a{" "}
                <span className="font-medium text-foreground font-mono-data">
                  {sentTo}
                </span>
                . Haz clic en el enlace para ingresar.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSent(false)}
                className="mt-2"
              >
                Usar otro correo
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo electronico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@empresa.com"
                    autoComplete="email"
                    autoFocus
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  aria-label="Enviar enlace de acceso"
                >
                  {isSubmitting
                    ? "Enviando..."
                    : "Enviar link de acceso"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
