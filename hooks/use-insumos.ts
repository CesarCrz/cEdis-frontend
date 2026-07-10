"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/insumos"
import type { InsumosParams } from "@/lib/api/insumos"

const STALE_5MIN = 5 * 60 * 1000

export function useInsumos(cedisId: string, params?: InsumosParams) {
  return useQuery({
    queryKey: ["insumos", cedisId, params],
    queryFn: () => api.getInsumos(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useInsumo(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["insumo", cedisId, id],
    queryFn: () => api.getInsumo(cedisId, id),
    enabled: !!id && !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateInsumo(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.createInsumo(cedisId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos", cedisId] }),
  })
}

export function useUpdateInsumo(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateInsumo(cedisId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["insumos", cedisId] })
    },
  })
}

export function useDeleteInsumo(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteInsumo(cedisId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos", cedisId] }),
  })
}

export function useImportInsumosCsv(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => api.importInsumosCsv(cedisId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insumos", cedisId] }),
  })
}
