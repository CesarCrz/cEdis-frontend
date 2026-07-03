import { apiClient } from "./client"
import type { InventarioItem } from "@/types/app.types"

export interface AjusteManualData {
  insumo_id: string
  cantidad_nueva: number
  motivo: string
}

export const inventarioApi = {
  list: (cedisId: string, params?: { cliente_id?: string }) =>
    apiClient<InventarioItem[]>(`/api/${cedisId}/inventario`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  ajusteManual: (cedisId: string, data: AjusteManualData) =>
    apiClient<{ success: boolean }>(`/api/${cedisId}/inventario/ajuste`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
