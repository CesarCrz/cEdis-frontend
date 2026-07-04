"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Handle PKCE flow: ?code= in query string
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace("/login?error=auth_failed")
        } else {
          router.replace("/cedis")
        }
      })
      return
    }

    // Handle implicit flow: #access_token= in hash — supabase client picks it up automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/cedis")
        return
      }

      // Wait for onAuthStateChange to fire with the hash token
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          subscription.unsubscribe()
          router.replace("/cedis")
        } else if (event === "SIGNED_OUT") {
          subscription.unsubscribe()
          router.replace("/login?error=auth_failed")
        }
      })

      // Timeout fallback — if nothing happens in 5s, something went wrong
      setTimeout(() => {
        subscription.unsubscribe()
        supabase.auth.getSession().then(({ data: { session } }) => {
          router.replace(session ? "/cedis" : "/login?error=auth_failed")
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
