"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/receta-categorias"

const STALE_5MIN = 5 * 60 * 1000

export function useRecetaCategorias(cedisId: string) {
  return useQuery({
    queryKey: ["receta-categorias", cedisId],
    queryFn: () => api.getRecetaCategorias(cedisId),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateRecetaCategoria(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => api.createRecetaCategoria(cedisId, nombre),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["receta-categorias", cedisId] }),
  })
}

export function useDeleteRecetaCategoria(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteRecetaCategoria(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["receta-categorias", cedisId] }),
  })
}
