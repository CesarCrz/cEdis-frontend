"use client"

import { useQuery } from "@tanstack/react-query"
import { kardexApi, type KardexParams } from "@/lib/api/kardex"

// The page searches client-side, so pull the full filtered range instead of
// the server's default 50-row page.
const LIST_PAGE_SIZE = 1000

export function useKardex(cedisId: string, params?: KardexParams) {
  const query = { pageSize: LIST_PAGE_SIZE, ...params }
  return useQuery({
    queryKey: ["kardex", cedisId, query],
    queryFn: () => kardexApi.list(cedisId, query),
    enabled: !!cedisId,
  })
}
