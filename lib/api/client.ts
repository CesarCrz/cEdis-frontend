import { createClient } from "@/lib/supabase/client"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  const { params, ...fetchOptions } = options

  const url = new URL(`${BACKEND_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const authHeader: Record<string, string> = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {}

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    })

    const json = await res.json()

    if (res.status === 401 && typeof window !== "undefined") {
      window.location.href = "/auth/login"
      return { data: null, error: "Sesión expirada" }
    }

    if (!res.ok) {
      return {
        data: null,
        error: json?.error?.message ?? json?.message ?? "Error del servidor",
      }
    }

    return { data: json.data ?? json, error: null }
  } catch {
    return { data: null, error: "Error de conexión" }
  }
}
