import { z } from "zod"

export const ventaDeclaradaItemSchema = z.object({
  receta_id: z.string().uuid("Receta requerida"),
  variacion_id: z.string().uuid().optional().nullable(),
  cantidad_vendida: z.number().positive("Cantidad debe ser positiva"),
})

export const createVentaDeclaradaSchema = z.object({
  cliente_id: z.string().uuid("Cliente requerido"),
  canal_id: z.string().uuid("Canal requerido"),
  periodo_inicio: z.string().min(1, "Fecha inicio requerida"),
  periodo_fin: z.string().min(1, "Fecha fin requerida"),
  notas: z.string().max(500).optional(),
  items: z
    .array(ventaDeclaradaItemSchema)
    .min(1, "Al menos un item requerido"),
})

export type VentaDeclaradaItemFormData = z.infer<
  typeof ventaDeclaradaItemSchema
>
export type CreateVentaDeclaradaFormData = z.infer<
  typeof createVentaDeclaradaSchema
>
