"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/insumos"
import type { InsumosParams } from "@/lib/api/insumos"

const STALE_5MIN = 5 * 60 * 1000

// Catalogs are loaded whole so that search/filter run over every row, not
// just the first server page (default 50).
const CATALOG_PAGE_SIZE = 1000

export function useInsumos(cedisId: string, params?: InsumosParams) {
  const query = { pageSize: CATALOG_PAGE_SIZE, ...params }
  return useQuery({
    queryKey: ["insumos", cedisId, query],
    queryFn: () => api.getInsumos(cedisId, query),
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
