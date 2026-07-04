"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // PKCE flow: ?code= in query string
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }: { error: Error | null }) => {
          router.replace(error ? "/login?error=auth_failed" : "/cedis")
        })
      return
    }

    // Implicit flow: hash token — supabase client auto-detects #access_token
    // Give it time to process the hash and fire the auth event
    let done = false

    const redirect = (session: Session | null) => {
      if (done) return
      done = true
      subscription.unsubscribe()
      router.replace(session ? "/cedis" : "/login?error=auth_failed")
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // SIGNED_IN, INITIAL_SESSION with session, or TOKEN_REFRESHED = success
        if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED")) {
          redirect(session)
        }
        // Do NOT redirect on SIGNED_OUT — it fires as initial event before hash is processed
      }
    )

    // Fallback: 10s — if still no session, check once and redirect accordingly
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      redirect(data.session)
    }, 10000)

    return () => {
      done = true
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Iniciando sesión...</p>
    </div>
  )
}
