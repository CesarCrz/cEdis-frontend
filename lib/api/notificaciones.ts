import { apiClient } from "./client"
import type { Notificacion } from "@/types/app.types"

export const notificacionesApi = {
  list: (cedisId: string) =>
    apiClient<Notificacion[]>(`/api/${cedisId}/notificaciones`),

  marcarLeida: (cedisId: string, id: string) =>
    apiClient<Notificacion>(`/api/${cedisId}/notificaciones/${id}/leer`, {
      method: "POST",
    }),

  marcarTodasLeidas: (cedisId: string) =>
    apiClient<{ success: boolean }>(
      `/api/${cedisId}/notificaciones/leer-todas`,
      { method: "POST" }
    ),
}
