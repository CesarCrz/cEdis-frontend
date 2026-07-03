"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api/dashboard"

export function useDashboard(
  cedisId: string,
  periodo?: "7d" | "30d" | "90d"
) {
  return useQuery({
    queryKey: ["dashboard", cedisId, periodo],
    queryFn: () => dashboardApi.get(cedisId, periodo),
    enabled: !!cedisId,
  })
}
