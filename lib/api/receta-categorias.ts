import { apiClient } from "./client"
import type { RecetaCategoria } from "@/types/app.types"

export async function getRecetaCategorias(cedisId: string) {
  return apiClient<RecetaCategoria[]>(`/api/${cedisId}/receta-categorias`)
}

export async function createRecetaCategoria(cedisId: string, nombre: string) {
  return apiClient<RecetaCategoria>(`/api/${cedisId}/receta-categorias`, {
    method: "POST",
    body: JSON.stringify({ nombre }),
  })
}

export async function updateRecetaCategoria(cedisId: string, id: string, nombre: string) {
  return apiClient<RecetaCategoria>(`/api/${cedisId}/receta-categorias/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre }),
  })
}

export async function deleteRecetaCategoria(cedisId: string, id: string) {
  return apiClient<null>(`/api/${cedisId}/receta-categorias/${id}`, { method: "DELETE" })
}
