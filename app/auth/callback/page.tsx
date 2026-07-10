"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/utils/logger"
import type { AuthResponse } from "@supabase/supabase-js"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const hash = window.location.hash

    logger.dev('[auth/callback] code:', !!code, '| hash:', !!hash)
    logger.sensitive('[auth/callback] URL:', window.location.href)

    // PKCE flow: ?code= in query string
    if (code) {
      logger.dev('[auth/callback] PKCE — exchanging code')
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }: { error: Error | null }) => {
          if (error) logger.error('[auth/callback] exchangeCode error:', error.message)
          router.replace(error ? "/login?error=auth_failed" : "/cedis")
        })
      return
    }

    // Implicit flow: @supabase/ssr doesn't auto-process hash — extract tokens manually
    if (hash.includes('access_token')) {
      logger.dev('[auth/callback] implicit — extracting tokens from hash')
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ data, error }: AuthResponse) => {
            if (error) logger.error('[auth/callback] setSession error:', error.message)
            router.replace(error || !data.session ? '/login?error=auth_failed' : '/cedis')
          })
        return
      }
    }

    logger.dev('[auth/callback] no auth params — redirecting to login')
    router.replace('/login?error=auth_failed')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Iniciando sesión...</p>
    </div>
  )
}
