"use client"

import { useQuery } from "@tanstack/react-query"
import * as api from "@/lib/api/uom"

export function useUnidadesMedida() {
  return useQuery({
    queryKey: ["unidades-medida"],
    queryFn: () => api.getUnidadesMedida(),
    staleTime: Infinity,
  })
}

export const useUom = useUnidadesMedida
