"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Warehouse } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiGridSkeleton } from "@/components/common/loading-skeleton"
import { EmptyState } from "@/components/common/empty-state"
import { useAuth } from "@/hooks/use-auth"
import { getCedisList } from "@/lib/api/cedis"
import { useCedisStore } from "@/store/cedis-store"
import { formatShortId, formatDate } from "@/lib/utils/format"
import type { Cedis } from "@/types/app.types"

export default function CedisPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { setActiveCedis } = useCedisStore()

  const [cedisList, setCedisList] = useState<Cedis[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getCedisList()
      .then(({ data }) => {
        if (!data) return
        if (data.length === 1) {
          setActiveCedis(data[0].id, data[0].nombre)
          router.push(`/${data[0].id}/dashboard`)
          return
        }
        if (data.length === 0) {
          router.push("/cedis/nuevo")
          return
        }
        setCedisList(data)
      })
      .finally(() => setLoading(false))
  }, [user, router, setActiveCedis])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-3xl px-4 space-y-6">
          <KpiGridSkeleton count={3} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tus centros de distribucion
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un CEDIS para continuar
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/cedis/nuevo" aria-label="Crear nuevo CEDIS">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden />
              Nuevo CEDIS
            </Link>
          </Button>
        </div>

        {cedisList.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="Sin centros de distribucion"
            description="Crea tu primer CEDIS para comenzar a gestionar tu inventario."
            action={{
              label: "Crear CEDIS",
              onClick: () => router.push("/cedis/nuevo"),
            }}
          />
        ) : (
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {cedisList.map((cedis) => (
              <li key={cedis.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCedis(cedis.id, cedis.nombre)
                    router.push(`/${cedis.id}/dashboard`)
                  }}
                  className="group w-full text-left rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Ir al CEDIS ${cedis.nombre}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                      <Warehouse
                        className="h-5 w-5 text-primary"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {cedis.nombre}
                      </p>
                      <p className="font-mono-data text-xs text-muted-foreground mt-0.5">
                        {formatShortId(cedis.id)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Creado {formatDate(cedis.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
