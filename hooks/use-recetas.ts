"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/recetas"
import type { RecetasParams } from "@/lib/api/recetas"

const STALE_5MIN = 5 * 60 * 1000

export function useRecetas(cedisId: string, params?: RecetasParams) {
  return useQuery({
    queryKey: ["recetas", cedisId, params],
    queryFn: () => api.getRecetas(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useReceta(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["receta", cedisId, id],
    queryFn: () => api.getReceta(cedisId, id),
    enabled: !!id && !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateReceta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.createReceta(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recetas", cedisId] }),
  })
}

export function useUpdateReceta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateReceta(cedisId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recetas", cedisId] })
    },
  })
}

export function useDeleteReceta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteReceta(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recetas", cedisId] }),
  })
}

export function useCloneReceta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.cloneReceta(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recetas", cedisId] }),
  })
}
