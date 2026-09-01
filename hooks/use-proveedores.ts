"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as api from "@/lib/api/proveedores"
import type { ProveedoresParams } from "@/lib/api/proveedores"

const STALE_5MIN = 5 * 60 * 1000

export function useProveedores(cedisId: string, params?: ProveedoresParams) {
  return useQuery({
    queryKey: ["proveedores", cedisId, params],
    queryFn: () => api.getProveedores(cedisId, params),
    enabled: !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useProveedor(cedisId: string, id: string) {
  return useQuery({
    queryKey: ["proveedor", cedisId, id],
    queryFn: () => api.getProveedor(cedisId, id),
    enabled: !!id && !!cedisId,
    staleTime: STALE_5MIN,
  })
}

export function useCreateProveedor(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.createProveedor(cedisId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["proveedores", cedisId] }),
  })
}

export function useUpdateProveedor(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      api.updateProveedor(cedisId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proveedores", cedisId] })
    },
  })
}

export function useDeleteProveedor(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteProveedor(cedisId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["proveedores", cedisId] }),
  })
}
