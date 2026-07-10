import { z } from "zod"

export const ingredienteSchema = z
  .object({
    tipo: z.enum(["insumo", "sub_receta"]),
    insumo_id: z.string().uuid().optional().nullable(),
    sub_receta_id: z.string().uuid().optional().nullable(),
    cantidad: z.number().positive("Cantidad debe ser positiva"),
    unidad_id: z.string().uuid("Unidad requerida"),
  })
  .refine(
    (d) =>
      d.tipo === "insumo"
        ? !!d.insumo_id
        : !!d.sub_receta_id,
    { message: "Selecciona un insumo o sub-receta" }
  )

export const recetaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  categoria_id: z.string().uuid().optional().nullable(),
  rendimiento: z.number().positive("Rendimiento debe ser positivo"),
  rendimiento_unidad_id: z.string().uuid().optional().nullable(),
  ingredientes: z
    .array(ingredienteSchema)
    .min(1, "Agrega al menos un ingrediente"),
})

export type IngredienteFormData = z.infer<typeof ingredienteSchema>
export type RecetaFormData = z.infer<typeof recetaSchema>
