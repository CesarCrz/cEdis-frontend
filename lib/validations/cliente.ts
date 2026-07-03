import { z } from "zod"

export const clienteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  telefono: z.string().max(50).optional(),
  email: z.string().email("Email invalido").max(200).optional().or(z.literal("")),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
