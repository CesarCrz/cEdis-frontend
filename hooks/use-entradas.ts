"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { entradasApi, type EntradasParams, type CreateEntradaData } from "@/lib/api/entradas"

const STALE_5MIN = 5 * 60 * 1000

export function useEntradas(cedisId: string, params?: EntradasParams) {
  return useQuery({
    queryKey: ["entradas", cedisId, params],
    queryFn: () => entradasApi.list(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useEntrada(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["entrada", cedisId, id],
    queryFn: () => entradasApi.get(cedisId, id),
    enabled: !!cedisId && !!id,
    staleTime: STALE_5MIN,
  })
}

export function useCreateEntrada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEntradaData) => entradasApi.create(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["entradas", cedisId] }),
  })
}

export function useUpdateEntrada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEntradaData> }) =>
      entradasApi.update(cedisId, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["entradas", cedisId] })
      qc.invalidateQueries({ queryKey: ["entrada", cedisId, id] })
    },
  })
}

export function useConfirmarEntrada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => entradasApi.confirmar(cedisId, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["entradas", cedisId] })
      qc.invalidateQueries({ queryKey: ["entrada", cedisId, id] })
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
      qc.invalidateQueries({ queryKey: ["kardex", cedisId] })
    },
  })
}

export function useCancelEntrada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => entradasApi.cancel(cedisId, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["entradas", cedisId] })
      qc.invalidateQueries({ queryKey: ["entrada", cedisId, id] })
    },
  })
}
