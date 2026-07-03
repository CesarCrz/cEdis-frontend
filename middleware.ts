import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/login", "/auth", "/invite"]

const isProd = process.env.NODE_ENV === "production"
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

const CSP = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${backendUrl}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

// Role cache: userId -> { role, expiresAt }
const roleCache = new Map<string, { role: string; expiresAt: number }>()
const ROLE_CACHE_TTL_MS = 30_000

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", CSP)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  )
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cs) {
          cs.forEach(({ name, value }) => request.cookies.set(name, value))
        },
      },
    }
  )

  const response = NextResponse.next({ request })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Authenticated user hitting /login → send to /cedis
  if (user && pathname === "/login") {
    return addSecurityHeaders(
      NextResponse.redirect(new URL("/cedis", request.url))
    )
  }

  // Public routes: allow through
  if (isPublicRoute(pathname)) {
    return addSecurityHeaders(response)
  }

  // No session → redirect to /login
  if (!user) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return addSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  // Viewer role enforcement for /{cedisId}/... routes
  const cedisRouteMatch = pathname.match(/^\/([^/]+)(\/.*)?$/)
  if (
    cedisRouteMatch &&
    !["cedis", "auth", "invite", "login"].includes(cedisRouteMatch[1])
  ) {
    const cedisId = cedisRouteMatch[1]
    const subPath = cedisRouteMatch[2] ?? "/dashboard"

    let role: string | null = null
    const cached = roleCache.get(user.id)
    if (cached && cached.expiresAt > Date.now()) {
      role = cached.role
    } else {
      const { data } = await supabase
        .from("cedis_members")
        .select("role")
        .eq("cedis_id", cedisId)
        .eq("user_id", user.id)
        .single()

      if (data?.role) {
        role = data.role as string
        roleCache.set(user.id, {
          role: role,
          expiresAt: Date.now() + ROLE_CACHE_TTL_MS,
        })
      }
    }

    if (role === "viewer" && !subPath.startsWith("/inventario")) {
      return addSecurityHeaders(
        NextResponse.redirect(
          new URL(`/${cedisId}/inventario`, request.url)
        )
      )
    }
  }

  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)",
  ],
}
