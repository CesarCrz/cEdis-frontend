"use client"

import { useQuery } from "@tanstack/react-query"
import { faltantesApi, type FaltantesParams } from "@/lib/api/faltantes"

export function useFaltantes(cedisId: string, params?: FaltantesParams) {
  return useQuery({
    queryKey: ["faltantes", cedisId, params],
    queryFn: () => faltantesApi.list(cedisId, params),
    enabled: !!cedisId,
  })
}
