import { apiClient } from "./client"
import type { KardexEntry, KardexTipo } from "@/types/app.types"

export interface KardexParams {
  insumo_id?: string
  tipo?: KardexTipo | KardexTipo[]
  cliente_id?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

export const kardexApi = {
  list: (cedisId: string, params?: KardexParams) =>
    apiClient<KardexEntry[]>(`/api/${cedisId}/kardex`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}
