import { z } from "zod"

export const ticketItemSchema = z.object({
  insumo_id: z.string().uuid("Insumo requerido"),
  cantidad: z.number().positive("Cantidad debe ser positiva"),
  unidad_id: z.string().uuid("Unidad requerida"),
  precio_unitario: z.number().min(0, "Precio no puede ser negativo"),
})

export const createTicketSchema = z.object({
  cliente_id: z.string().uuid("Cliente requerido"),
  notas: z.string().max(500).optional(),
  items: z.array(ticketItemSchema).min(1, "Al menos un item requerido"),
})

export const batchTicketSchema = z.object({
  cliente_ids: z
    .array(z.string().uuid())
    .min(1, "Selecciona al menos un cliente"),
  items: z.array(ticketItemSchema).min(1, "Al menos un item requerido"),
})

export type TicketItemFormData = z.infer<typeof ticketItemSchema>
export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type BatchTicketFormData = z.infer<typeof batchTicketSchema>
