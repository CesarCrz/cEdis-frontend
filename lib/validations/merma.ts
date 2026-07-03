import { z } from "zod"

export const createMermaSchema = z.object({
  insumo_id: z.string().uuid("Insumo requerido"),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  unidad_id: z.string().uuid("Unidad requerida"),
  motivo: z.string().min(1, "Motivo requerido").max(500),
})

export type CreateMermaFormData = z.infer<typeof createMermaSchema>
