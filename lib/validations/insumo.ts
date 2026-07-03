import { z } from "zod"

export const insumoSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  sku: z.string().max(100).optional(),
  categoria_id: z.string().uuid().optional().nullable(),
  unidad_id: z.string().min(1, "Unidad requerida"),
  costo_unitario: z.number().min(0, "Costo no puede ser negativo"),
  stock_minimo: z.number().min(0),
  stock_inicial: z.number().min(0),
  proveedor_id: z.string().uuid().optional().nullable(),
})

export type InsumoFormData = z.infer<typeof insumoSchema>
