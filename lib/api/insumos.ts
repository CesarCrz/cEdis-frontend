import { apiClient } from "./client"
import type { Insumo } from "@/types/app.types"

export interface InsumosParams {
  search?: string
  categoria_id?: string
  proveedor_id?: string
  alerta?: string
  page?: number
  pageSize?: number
}

export async function getInsumos(cedisId: string, params?: InsumosParams) {
  return apiClient<Insumo[]>(`/api/${cedisId}/insumos`, {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getInsumo(cedisId: string, id: string) {
  return apiClient<Insumo>(`/api/${cedisId}/insumos/${id}`)
}

export async function createInsumo(cedisId: string, data: unknown) {
  return apiClient<Insumo>(`/api/${cedisId}/insumos`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateInsumo(cedisId: string, id: string, data: unknown) {
  return apiClient<Insumo>(`/api/${cedisId}/insumos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteInsumo(cedisId: string, id: string) {
  return apiClient<{ success: boolean }>(`/api/${cedisId}/insumos/${id}`, {
    method: "DELETE",
  })
}

export async function importInsumosCsv(cedisId: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient<{ imported: number; errors: string[] }>(
    `/api/${cedisId}/insumos/import-csv`,
    {
      method: "POST",
      body: formData,
      headers: {},
    }
  )
}
