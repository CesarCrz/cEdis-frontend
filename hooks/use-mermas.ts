"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mermasApi, type CreateMermaData } from "@/lib/api/mermas"

// The page searches client-side, so pull the full list instead of the
// server's default 50-row page.
const LIST_PAGE_SIZE = "1000"

export function useMermas(cedisId: string, params?: Record<string, string>) {
  const query = { pageSize: LIST_PAGE_SIZE, ...params }
  return useQuery({
    queryKey: ["mermas", cedisId, query],
    queryFn: () => mermasApi.list(cedisId, query),
    enabled: !!cedisId,
  })
}

export function useCreateMerma(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMermaData) => mermasApi.create(cedisId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mermas", cedisId] })
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
      qc.invalidateQueries({ queryKey: ["kardex", cedisId] })
    },
  })
}
