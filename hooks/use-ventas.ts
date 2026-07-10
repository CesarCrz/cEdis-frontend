"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ventasApi,
  type VentasParams,
  type CreateTicketData,
  type BatchTicketData,
} from "@/lib/api/ventas"

const STALE_5MIN = 5 * 60 * 1000

export function useVentas(cedisId: string, params?: VentasParams) {
  return useQuery({
    queryKey: ["ventas", cedisId, params],
    queryFn: () => ventasApi.list(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useVenta(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["venta", cedisId, id],
    queryFn: () => ventasApi.get(cedisId, id),
    enabled: !!cedisId && !!id,
    staleTime: STALE_5MIN,
  })
}

export function useCreateVenta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTicketData) => ventasApi.create(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ventas", cedisId] }),
  })
}

export function useConfirmarVenta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ventasApi.confirmar(cedisId, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["ventas", cedisId] })
      qc.invalidateQueries({ queryKey: ["venta", cedisId, id] })
    },
  })
}

export function useEntregarVenta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ventasApi.entregar(cedisId, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["ventas", cedisId] })
      qc.invalidateQueries({ queryKey: ["venta", cedisId, id] })
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
      qc.invalidateQueries({ queryKey: ["kardex", cedisId] })
    },
  })
}

export function useCancelVenta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ventasApi.cancel(cedisId, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["ventas", cedisId] })
      qc.invalidateQueries({ queryKey: ["venta", cedisId, id] })
    },
  })
}

export function useBatchVenta(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BatchTicketData) => ventasApi.batch(cedisId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ventas", cedisId] })
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
    },
  })
}
