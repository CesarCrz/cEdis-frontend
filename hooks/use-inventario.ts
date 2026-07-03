"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { inventarioApi, type AjusteManualData } from "@/lib/api/inventario"

export function useInventario(
  cedisId: string,
  params?: { cliente_id?: string }
) {
  return useQuery({
    queryKey: ["inventario", cedisId, params],
    queryFn: () => inventarioApi.list(cedisId, params),
    enabled: !!cedisId,
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
