"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowLeft, Warehouse } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCedis } from "@/lib/api/cedis"
import { useCedisStore } from "@/store/cedis-store"

const schema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "Maximo 100 caracteres"),
  descripcion: z.string().max(500, "Maximo 500 caracteres").optional(),
})

type FormData = z.infer<typeof schema>

export default function NuevoCedisPage() {
  const router = useRouter()
  const { setActiveCedis } = useCedisStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    const { data: cedis, error } = await createCedis({
      nombre: data.nombre,
      descripcion: data.descripcion || undefined,
    })

    if (error || !cedis) {
      toast.error(error ?? "No se pudo crear el CEDIS")
      return
    }

    setActiveCedis(cedis.id, cedis.nombre)
    toast.success(`CEDIS "${cedis.nombre}" creado`)
    router.push(`/${cedis.id}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cedis" aria-label="Volver a la lista de CEDIS">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Nuevo centro de distribucion
            </h1>
            <p className="text-sm text-muted-foreground">
              Configura tu nuevo CEDIS
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Warehouse className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              CEDIS
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">
                  Nombre <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej. CEDIS Norte"
                  autoFocus
                  aria-required="true"
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? "nombre-error" : undefined}
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <p
                    id="nombre-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="descripcion">Descripcion</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripcion opcional del CEDIS"
                  rows={3}
                  aria-invalid={!!errors.descripcion}
                  aria-describedby={
                    errors.descripcion ? "descripcion-error" : undefined
                  }
                  {...register("descripcion")}
                />
                {errors.descripcion && (
                  <p
                    id="descripcion-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.descripcion.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  aria-label="Crear CEDIS"
                >
                  {isSubmitting ? "Creando..." : "Crear CEDIS"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
