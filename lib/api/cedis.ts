import { apiClient } from "./client"
import type { Cedis } from "@/types/app.types"

export async function getCedisList() {
  return apiClient<Cedis[]>("/api/cedis")
}

export async function createCedis(data: {
  nombre: string
  descripcion?: string
}) {
  return apiClient<Cedis>("/api/cedis", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getCedis(cedisId: string) {
  return apiClient<Cedis>(`/api/cedis/${cedisId}`)
}

export async function updateCedis(
  cedisId: string,
  data: Partial<Pick<Cedis, "nombre" | "descripcion">>
) {
  return apiClient<Cedis>(`/api/cedis/${cedisId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
