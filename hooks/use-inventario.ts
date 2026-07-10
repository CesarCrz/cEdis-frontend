"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventarioApi, type AjusteManualData } from "@/lib/api/inventario"
export type { SucursalItem } from "@/lib/api/inventario"

const STALE_5MIN = 5 * 60 * 1000

export function useInventario(
  cedisId: string,
  params?: { cliente_id?: string }
) {
  return useQuery({
    queryKey: ["inventario", cedisId, params],
    queryFn: () => inventarioApi.list(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useSucursalInventario(cedisId: string, clienteId: string) {
  return useQuery({
    queryKey: ["inventario-sucursal", cedisId, clienteId],
    queryFn: () => inventarioApi.listSucursal(cedisId, clienteId),
    enabled: !!cedisId && !!clienteId,
    staleTime: STALE_5MIN,
  })
}

export function useAjusteManual(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AjusteManualData) =>
      inventarioApi.ajusteManual(cedisId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventario", cedisId] })
      qc.invalidateQueries({ queryKey: ["kardex", cedisId] })
      qc.invalidateQueries({ queryKey: ["insumos", cedisId] })
    },
  })
}
