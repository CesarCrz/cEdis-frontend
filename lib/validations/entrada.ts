import { z } from "zod"

export const entradaItemSchema = z.object({
  insumo_id: z.string().uuid("Insumo requerido"),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  unidad_id: z.string().uuid("Unidad requerida"),
  costo_unitario: z.number().min(0, "Costo no puede ser negativo"),
})

export const createEntradaSchema = z.object({
  proveedor_id: z.string().uuid().optional().nullable(),
  notas: z.string().max(500).optional(),
  items: z.array(entradaItemSchema).min(1, "Al menos un item requerido"),
})

export type EntradaItemFormData = z.infer<typeof entradaItemSchema>
export type CreateEntradaFormData = z.infer<typeof createEntradaSchema>
