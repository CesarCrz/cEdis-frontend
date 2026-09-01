import { apiClient } from "./client"
import type { CanalVenta } from "@/types/app.types"

export const canalesApi = {
  list: (cedisId: string) =>
    // Load the whole catalog: the server pages at 50 by default.
    apiClient<CanalVenta[]>(`/api/${cedisId}/canales-venta`, {
      params: { pageSize: 1000 },
    }),

  create: (cedisId: string, data: { nombre: string; comision_pct?: number }) =>
    apiClient<CanalVenta>(`/api/${cedisId}/canales-venta`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    cedisId: string,
    id: string,
    data: { nombre?: string; comision_pct?: number; activo?: boolean }
  ) =>
    apiClient<CanalVenta>(`/api/${cedisId}/canales-venta/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (cedisId: string, id: string) =>
    apiClient<{ success: boolean }>(`/api/${cedisId}/canales-venta/${id}`, {
      method: "DELETE",
    }),
}
