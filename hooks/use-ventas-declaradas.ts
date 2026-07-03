"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ventasDeclaradasApi,
  type VentasDeclaradasParams,
  type CreateVentaDeclaradaData,
} from "@/lib/api/ventas-declaradas"

export function useVentasDeclaradas(
  cedisId: string,
  params?: VentasDeclaradasParams
) {
  return useQuery({
    queryKey: ["ventas-declaradas", cedisId, params],
    queryFn: () => ventasDeclaradasApi.list(cedisId, params),
    enabled: !!cedisId,
  })
}

export function useVentaDeclarada(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["venta-declarada", cedisId, id],
    queryFn: () => ventasDeclaradasApi.get(cedisId, id),
    enabled: !!cedisId && !!id,
  })
}

export function useCreateVentaDeclarada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVentaDeclaradaData) =>
      ventasDeclaradasApi.create(cedisId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ventas-declaradas", cedisId] })
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
      qc.invalidateQueries({ queryKey: ["kardex", cedisId] })
    },
  })
}

export function useDeleteVentaDeclarada(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ventasDeclaradasApi.delete(cedisId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["ventas-declaradas", cedisId] }),
  })
}
