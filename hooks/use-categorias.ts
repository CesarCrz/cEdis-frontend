"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/categorias"

const STALE_5MIN = 5 * 60 * 1000

export function useCategorias(cedisId: string) {
  return useQuery({
    queryKey: ["categorias", cedisId],
    queryFn: () => api.getCategorias(cedisId),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateCategoria(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => api.createCategoria(cedisId, nombre),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categorias", cedisId] }),
  })
}

export function useUpdateCategoria(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      api.updateCategoria(cedisId, id, nombre),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categorias", cedisId] }),
  })
}

export function useDeleteCategoria(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCategoria(cedisId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["categorias", cedisId] }),
  })
}
