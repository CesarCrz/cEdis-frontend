"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Warehouse, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiCardSkeleton } from "@/components/common/loading-skeleton"
import type { Invitation } from "@/types/app.types"
import { formatDate } from "@/lib/utils/format"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/invitations/${token}`)
      .then((r) => r.json())
      .then(({ data, error: err }) => {
        if (err) setError(err)
        else setInvitation(data)
      })
      .catch(() => setError("No se pudo cargar la invitacion"))
      .finally(() => setLoading(false))
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/invitations/${token}/accept`, {
        method: "POST",
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.message ?? "Error al aceptar")
      }
      toast.success("Invitacion aceptada")
      router.push("/cedis")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10">
            <Warehouse className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <h1 className="text-xl font-bold tracking-tight">cEdis</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {loading && (
            <div className="space-y-3">
              <KpiCardSkeleton />
            </div>
          )}

          {!loading && error && (
            <div className="text-center space-y-3">
              <XCircle className="h-10 w-10 text-destructive mx-auto" aria-hidden />
              <h2 className="text-base font-semibold">Invitacion invalida</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/login")}
              >
                Ir al inicio de sesion
              </Button>
            </div>
          )}

          {!loading && !error && invitation && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-10 w-10 text-stock-ok mx-auto" aria-hidden />
              <div>
                <h2 className="text-base font-semibold">
                  Invitacion a{" "}
                  <span className="text-primary">
                    {invitation.cedis?.nombre}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Fuiste invitado como{" "}
                  <span className="font-medium text-foreground">
                    {invitation.role}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expira el {formatDate(invitation.expires_at)}
                </p>
              </div>
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full"
                aria-label="Aceptar invitacion"
              >
                {accepting ? "Aceptando..." : "Aceptar invitacion"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
