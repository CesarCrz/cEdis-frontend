"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { canalesApi } from "@/lib/api/canales"

export function useCanales(cedisId: string) {
  return useQuery({
    queryKey: ["canales", cedisId],
    queryFn: () => canalesApi.list(cedisId),
    enabled: !!cedisId,
  })
}

export function useCreateCanal(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) =>
      canalesApi.create(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["canales", cedisId] }),
  })
}

export function useUpdateCanal(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { nombre?: string; descripcion?: string; activo?: boolean }
    }) => canalesApi.update(cedisId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["canales", cedisId] }),
  })
}

export function useDeleteCanal(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => canalesApi.delete(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["canales", cedisId] }),
  })
}
