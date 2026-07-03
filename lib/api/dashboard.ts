import { apiClient } from "./client"
import type { DashboardData } from "@/types/app.types"

export const dashboardApi = {
  get: (cedisId: string, periodo?: "7d" | "30d" | "90d") =>
    apiClient<DashboardData>(`/api/${cedisId}/dashboard`, {
      params: periodo ? { periodo } : undefined,
    }),
}
