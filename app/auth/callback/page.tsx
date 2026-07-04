"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // PKCE flow: ?code= in query string (server-exchangeable)
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

    // Implicit flow: #access_token= in hash — supabase client picks it up automatically
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (data.session) {
        router.replace("/cedis")
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          if (session) {
            subscription.unsubscribe()
            router.replace("/cedis")
          } else if (event === "SIGNED_OUT") {
            subscription.unsubscribe()
            router.replace("/login?error=auth_failed")
          }
        }
      )

      // Fallback: 5s timeout
      setTimeout(() => {
        subscription.unsubscribe()
        supabase.auth.getSession().then(({ data: d }: { data: { session: Session | null } }) => {
          router.replace(d.session ? "/cedis" : "/login?error=auth_failed")
        })
      }, 5000)
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Iniciando sesión...</p>
    </div>
  )
}
