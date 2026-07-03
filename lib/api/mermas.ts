import { apiClient } from "./client"
import type { Merma } from "@/types/app.types"

export interface CreateMermaData {
  insumo_id: string
  cantidad: number
  unidad_id: string
  motivo: string
}

export const mermasApi = {
  list: (cedisId: string, params?: Record<string, string>) =>
    apiClient<Merma[]>(`/api/${cedisId}/mermas`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  create: (cedisId: string, data: CreateMermaData) =>
    apiClient<Merma>(`/api/${cedisId}/mermas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
