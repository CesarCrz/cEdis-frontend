"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/clientes"
import type { ClientesParams } from "@/lib/api/clientes"

const STALE_5MIN = 5 * 60 * 1000

export function useClientes(cedisId: string, params?: ClientesParams) {
  return useQuery({
    queryKey: ["clientes", cedisId, params],
    queryFn: () => api.getClientes(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCliente(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["cliente", cedisId, id],
    queryFn: () => api.getCliente(cedisId, id),
    enabled: !!id && !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateCliente(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.createCliente(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes", cedisId] }),
  })
}

export function useUpdateCliente(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateCliente(cedisId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes", cedisId] })
    },
  })
}

export function useDeleteCliente(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteCliente(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes", cedisId] }),
  })
}
