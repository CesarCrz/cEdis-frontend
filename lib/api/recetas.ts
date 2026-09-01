import { apiClient, apiClientAll } from "./client"
import type { Receta } from "@/types/app.types"

export interface RecetasParams {
  search?: string
  page?: number
  pageSize?: number
}

export async function getRecetas(cedisId: string, params?: RecetasParams) {
  return apiClientAll<Receta>(`/api/${cedisId}/recetas`, {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getReceta(cedisId: string, id: string) {
  return apiClient<Receta>(`/api/${cedisId}/recetas/${id}`)
}

export async function createReceta(cedisId: string, data: unknown) {
  return apiClient<Receta>(`/api/${cedisId}/recetas`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateReceta(cedisId: string, id: string, data: unknown) {
  return apiClient<Receta>(`/api/${cedisId}/recetas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteReceta(cedisId: string, id: string) {
  return apiClient<{ success: boolean }>(`/api/${cedisId}/recetas/${id}`, {
    method: "DELETE",
  })
}

export async function importRecetasCsv(cedisId: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient<{ imported: number; errors: { row: number; message: string }[] }>(
    `/api/${cedisId}/recetas/import-csv`,
    {
      method: "POST",
      body: formData,
    }
  )
}

export async function cloneReceta(cedisId: string, id: string) {
  return apiClient<Receta>(`/api/${cedisId}/recetas/${id}/clone`, {
    method: "POST",
  })
}
