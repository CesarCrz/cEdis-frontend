import { apiClient } from "./client"
import type { CanalVenta } from "@/types/app.types"

export const canalesApi = {
  list: (cedisId: string) =>
    apiClient<CanalVenta[]>(`/api/${cedisId}/canales`),

  create: (cedisId: string, data: { nombre: string; descripcion?: string }) =>
    apiClient<CanalVenta>(`/api/${cedisId}/canales`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    cedisId: string,
    id: string,
    data: { nombre?: string; descripcion?: string; activo?: boolean }
  ) =>
    apiClient<CanalVenta>(`/api/${cedisId}/canales/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (cedisId: string, id: string) =>
    apiClient<{ success: boolean }>(`/api/${cedisId}/canales/${id}`, {
      method: "DELETE",
    }),
}
