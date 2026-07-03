import { z } from "zod"

export const proveedorSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(200).optional().or(z.literal("")),
  notas: z.string().max(1000).optional(),
})

export type ProveedorFormData = z.infer<typeof proveedorSchema>
