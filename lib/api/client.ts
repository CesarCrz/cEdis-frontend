import { createClient } from "@/lib/supabase/client"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

/** Pagination metadata returned by list endpoints. */
export interface PageMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiResult<T> {
  data: T | null
  error: string | null
  meta?: PageMeta
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const { params, headers: optionHeaders, ...fetchOptions } = options

  const url = new URL(`${BACKEND_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // FormData must not carry a manual Content-Type: the browser sets it
  // along with the multipart boundary.
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
    ...((optionHeaders as Record<string, string>) ?? {}),
  }

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
      ...fetchOptions,
      headers,
    })

    const json = await res.json()

    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login"
      return { data: null, error: "Sesión expirada" }
    }

    if (!res.ok) {
      return {
        data: null,
        error: json?.error?.message ?? json?.message ?? "Error del servidor",
      }
    }

    return { data: json.data ?? json, error: null, meta: json.meta }
  } catch {
    return { data: null, error: "Error de conexión" }
  }
}

const FETCH_ALL_PAGE_SIZE = 500
// Hard stop so a runaway dataset can never lock up the browser. Lists that can
// legitimately grow past this (kardex, mermas) search server-side instead.
const FETCH_ALL_MAX_PAGES = 40

/**
 * Load every page of a list endpoint, not just the first.
 *
 * Catalogs (insumos, recetas, clientes...) are filtered client-side for instant
 * search, which only works if the browser actually holds every row. This walks
 * the server's pagination until `meta.pages` is exhausted.
 */
export async function apiClientAll<T>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResult<T[]> & { truncated: boolean }> {
  const baseParams = { ...(options.params ?? {}) }
  const pageSize = Number(baseParams.pageSize ?? FETCH_ALL_PAGE_SIZE)

  const first = await apiClient<T[]>(path, {
    ...options,
    params: { ...baseParams, page: 1, pageSize },
  })
  if (first.error || !first.data) {
    return { data: null, error: first.error, truncated: false }
  }

  const totalPages = first.meta?.pages ?? 1
  const rows = [...first.data]

  const lastPage = Math.min(totalPages, FETCH_ALL_MAX_PAGES)
  for (let page = 2; page <= lastPage; page++) {
    const next = await apiClient<T[]>(path, {
      ...options,
      params: { ...baseParams, page, pageSize },
    })
    if (next.error || !next.data) {
      // Partial data is still useful; flag it so the UI can warn.
      return { data: rows, error: null, meta: first.meta, truncated: true }
    }
    rows.push(...next.data)
  }

  return {
    data: rows,
    error: null,
    meta: first.meta,
    truncated: totalPages > lastPage,
  }
}
