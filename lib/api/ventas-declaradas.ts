import { apiClient } from "./client"
import type { VentaDeclarada } from "@/types/app.types"

export interface VentasDeclaradasParams {
  cliente_id?: string
  canal_id?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

export interface CreateVentaDeclaradaData {
  cliente_id: string
  canal_id: string
  periodo_inicio: string
  periodo_fin: string
  notas?: string
  items: {
    receta_id: string
    variacion_id?: string | null
    cantidad_vendida: number
  }[]
}

export const ventasDeclaradasApi = {
  list: (cedisId: string, params?: VentasDeclaradasParams) =>
    apiClient<VentaDeclarada[]>(`/api/${cedisId}/ventas-declaradas`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (cedisId: string, id: string) =>
    apiClient<VentaDeclarada>(`/api/${cedisId}/ventas-declaradas/${id}`),

  create: (cedisId: string, data: CreateVentaDeclaradaData) =>
    apiClient<VentaDeclarada>(`/api/${cedisId}/ventas-declaradas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    cedisId: string,
    id: string,
    data: Partial<CreateVentaDeclaradaData>
  ) =>
    apiClient<VentaDeclarada>(`/api/${cedisId}/ventas-declaradas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (cedisId: string, id: string) =>
    apiClient<{ success: boolean }>(
      `/api/${cedisId}/ventas-declaradas/${id}`,
      { method: "DELETE" }
    ),
}
