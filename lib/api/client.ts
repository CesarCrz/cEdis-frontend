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

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    })

    const json = await res.json()

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
