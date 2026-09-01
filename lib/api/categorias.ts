import { apiClient } from "./client"
import type { Categoria } from "@/types/app.types"

export async function getCategorias(cedisId: string) {
  // Load the whole catalog: the server pages at 50 by default.
  return apiClient<Categoria[]>(`/api/${cedisId}/categorias`, {
    params: { pageSize: 1000 },
  })
}

export async function createCategoria(cedisId: string, nombre: string) {
  return apiClient<Categoria>(`/api/${cedisId}/categorias`, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  })
}

export async function updateCategoria(cedisId: string, id: string, nombre: string) {
  return apiClient<Categoria>(`/api/${cedisId}/categorias/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre }),
  })
}

export async function deleteCategoria(cedisId: string, id: string) {
  return apiClient<null>(`/api/${cedisId}/categorias/${id}`, { method: "DELETE" })
}
