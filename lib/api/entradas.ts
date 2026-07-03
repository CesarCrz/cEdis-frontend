import { apiClient } from "./client"
import type { Entrada } from "@/types/app.types"

export interface EntradasParams {
  status?: string
  proveedor_id?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

export interface CreateEntradaData {
  proveedor_id?: string | null
  notas?: string
  items: {
    insumo_id: string
    cantidad: number
    unidad_id: string
    costo_unitario: number
  }[]
}

export const entradasApi = {
  list: (cedisId: string, params?: EntradasParams) =>
    apiClient<Entrada[]>(`/api/${cedisId}/entradas`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (cedisId: string, id: string) =>
    apiClient<Entrada>(`/api/${cedisId}/entradas/${id}`),

  create: (cedisId: string, data: CreateEntradaData) =>
    apiClient<Entrada>(`/api/${cedisId}/entradas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (cedisId: string, id: string, data: Partial<CreateEntradaData>) =>
    apiClient<Entrada>(`/api/${cedisId}/entradas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  confirmar: (cedisId: string, id: string) =>
    apiClient<Entrada>(`/api/${cedisId}/entradas/${id}/confirmar`, {
      method: "POST",
    }),

  cancel: (cedisId: string, id: string) =>
    apiClient<Entrada>(`/api/${cedisId}/entradas/${id}/cancel`, {
      method: "POST",
    }),
}
