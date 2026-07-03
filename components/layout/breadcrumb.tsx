"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useCedisStore } from "@/store/cedis-store"
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
  const { activeCedisName } = useCedisStore()

  const segments = pathname.split("/").filter(Boolean)

  // Build breadcrumb items
  const items: { label: string; href: string }[] = []
  let accumulatedPath = ""

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    accumulatedPath += `/${seg}`

    if (i === 0 && seg.length === 36) {
      // UUID — this is the cedisId
      items.push({
        label: activeCedisName ?? seg.slice(0, 8).toUpperCase(),
        href: `/${seg}/dashboard`,
      })
    } else {
      const label = SEGMENT_LABELS[seg] ?? seg
      items.push({ label, href: accumulatedPath })
    }
  }

  if (items.length === 0) return null

  return (
    <nav aria-label="Navegacion de migas" className="flex items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={item.href} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 text-muted-foreground"
                aria-hidden
              />
            )}
            {isLast ? (
              <span
                className="text-sm font-medium text-foreground"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-sm text-muted-foreground hover:text-foreground transition-colors",
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
