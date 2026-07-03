import { z } from "zod"

export const ingredienteSchema = z.object({
  insumo_id: z.string().min(1, "Insumo requerido"),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  unidad_id: z.string().min(1, "Unidad requerida"),
})

export const recetaSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  ingredientes: z
    .array(ingredienteSchema)
    .min(1, "Agrega al menos un ingrediente"),
})

export type IngredienteFormData = z.infer<typeof ingredienteSchema>
export type RecetaFormData = z.infer<typeof recetaSchema>
