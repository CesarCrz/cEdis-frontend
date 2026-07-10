"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronRight, ChevronDown, Warehouse, Check, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useCedisStore } from "@/store/cedis-store"
import { useCedisList } from "@/hooks/use-cedis"
import { cn } from "@/lib/utils"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  entradas: "Entradas",
  ventas: "Ventas",
  "ventas-declaradas": "Ventas Declaradas",
  clientes: "Clientes",
  insumos: "Insumos",
  recetas: "Recetas",
  inventario: "Inventario",
  kardex: "Kardex",
  faltantes: "Faltantes",
  proveedores: "Proveedores",
  usuarios: "Usuarios",
  configuracion: "Configuracion",
  nuevo: "Nuevo",
  editar: "Editar",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeCedisName, activeCedisId, setActiveCedis } = useCedisStore()
  const { data: cedisRes } = useCedisList()
  const cedisList = cedisRes?.data ?? []

  const segments = pathname.split("/").filter(Boolean)

  const items: { label: string; href: string; isCedis?: boolean }[] = []
  let accumulatedPath = ""

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    accumulatedPath += `/${seg}`

    if (i === 0 && seg.length === 36) {
      items.push({ label: activeCedisName ?? seg.slice(0, 8).toUpperCase(), href: accumulatedPath, isCedis: true })
    } else {
      items.push({ label: SEGMENT_LABELS[seg] ?? seg, href: accumulatedPath })
    }
  }

  if (items.length === 0) return null

  return (
    <nav aria-label="Navegacion de migas" className="flex items-center gap-1 min-w-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.href} className="flex items-center gap-1 min-w-0">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
            )}

            {item.isCedis ? (
              // CEDIS segment — inline switcher dropdown
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 text-sm rounded px-1 -mx-1 py-0.5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isLast
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground transition-colors"
                    )}
                    aria-label="Cambiar CEDIS"
                  >
                    <Warehouse className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate max-w-[120px]">{item.label}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px]">
                  {cedisList.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Mis centros de distribución
                      </DropdownMenuLabel>
                      {cedisList.map((cedis) => (
                        <DropdownMenuItem
                          key={cedis.id}
                          onClick={() => {
                            setActiveCedis(cedis.id, cedis.nombre)
                            router.push(`/${cedis.id}/dashboard`)
                          }}
                          className="cursor-pointer gap-2"
                        >
                          <Warehouse className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                          <span className="truncate flex-1">{cedis.nombre}</span>
                          {cedis.id === activeCedisId && (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push("/cedis/nuevo")}
                    className="cursor-pointer gap-2"
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden />
                    <span>Nuevo CEDIS</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isLast ? (
              <span className="text-sm font-medium text-foreground truncate" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground transition-colors truncate",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                )}
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
