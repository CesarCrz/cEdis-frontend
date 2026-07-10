"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificacionesApi } from "@/lib/api/notificaciones"

export function useNotificaciones(cedisId: string) {
  return useQuery({
    queryKey: ["notificaciones", cedisId],
    queryFn: () => notificacionesApi.list(cedisId),
    enabled: !!cedisId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useMarcarLeida(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificacionesApi.marcarLeida(cedisId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notificaciones", cedisId] }),
  })
}

export function useMarcarTodasLeidas(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificacionesApi.marcarTodasLeidas(cedisId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notificaciones", cedisId] }),
  })
}
