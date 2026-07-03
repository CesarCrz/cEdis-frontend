"use client"

import { useQuery } from "@tanstack/react-query"
import { kardexApi, type KardexParams } from "@/lib/api/kardex"

export function useKardex(cedisId: string, params?: KardexParams) {
  return useQuery({
    queryKey: ["kardex", cedisId, params],
    queryFn: () => kardexApi.list(cedisId, params),
    enabled: !!cedisId,
  })
}
