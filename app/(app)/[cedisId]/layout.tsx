"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { useCedisStore } from "@/store/cedis-store"
import { useAuth } from "@/hooks/use-auth"
import type { Role } from "@/lib/constants"
import type { Cedis } from "@/types/app.types"
import { getCedisList } from "@/lib/api/cedis"

interface AppShellLayoutProps {
  children: React.ReactNode
  params: Promise<{ cedisId: string }>
}

export default function AppShellLayout({
  children,
  params,
}: AppShellLayoutProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { setActiveCedis } = useCedisStore()

  const [cedisId, setCedisId] = useState<string | null>(null)
  const [role, setRole] = useState<Role>("viewer")
  const [cedisList, setCedisList] = useState<Cedis[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    params.then(({ cedisId: id }) => {
      setCedisId(id)
      setActiveCedis(id)
    })
  }, [params, setActiveCedis])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getCedisList().then(({ data }) => {
      if (data) {
        setCedisList(data)
        const found = data.find((c) => c.id === cedisId)
        if (found) setActiveCedis(found.id, found.nombre)
      }
    })
    // Role would be fetched from the backend in a real scenario.
    // Default to operator so viewer restriction only applies when set explicitly.
    setRole("operator")
  }, [user, cedisId, setActiveCedis])

  if (loading || !user || !cedisId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
      >
        Saltar al contenido principal
      </a>

      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — desktop */}
        <div className="hidden md:flex md:shrink-0">
          <Sidebar cedisId={cedisId} role={role} />
        </div>

        {/* Sidebar — mobile sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="w-[240px] p-0 bg-sidebar border-r border-sidebar-border"
          >
            <Sidebar cedisId={cedisId} role={role} />
          </SheetContent>
        </Sheet>

        {/* Main column */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Navbar
            cedisList={cedisList}
            currentCedisId={cedisId}
            onMenuToggle={() => setMobileOpen(true)}
          />

          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
