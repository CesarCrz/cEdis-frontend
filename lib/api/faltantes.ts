import { apiClient } from "./client"
import type { Faltante } from "@/types/app.types"

export interface FaltantesParams {
  categoria_id?: string
  nivel?: "warn" | "low" | "critical"
}

export const faltantesApi = {
  list: (cedisId: string, params?: FaltantesParams) =>
    apiClient<Faltante[]>(`/api/${cedisId}/faltantes`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}
