"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { mermasApi, type CreateMermaData } from "@/lib/api/mermas"

export function useMermas(cedisId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: ["mermas", cedisId, params],
    queryFn: () => mermasApi.list(cedisId, params),
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
