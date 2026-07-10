"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingCart,
  Receipt,
  Users,
  Package,
  ChefHat,
  Warehouse,
  BookOpen,
  AlertTriangle,
  Truck,
  UserCog,
  Settings,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/constants"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  roles?: Role[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

function getNavGroups(cedisId: string): NavGroup[] {
  return [
    {
      label: "Principal",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          href: `/${cedisId}`,
          roles: ["owner", "admin", "operator"],
        },
      ],
    },
    {
      label: "Operativo",
      items: [
        {
          icon: PackagePlus,
          label: "Entradas",
          href: `/${cedisId}/entradas`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: ShoppingCart,
          label: "Ventas",
          href: `/${cedisId}/ventas`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: Receipt,
          label: "Ventas Declaradas",
          href: `/${cedisId}/ventas-declaradas`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: Trash2,
          label: "Mermas",
          href: `/${cedisId}/mermas`,
          roles: ["owner", "admin", "operator"],
        },
      ],
    },
    {
      label: "Inventario",
      items: [
        {
          icon: Warehouse,
          label: "Inventario",
          href: `/${cedisId}/inventario`,
          roles: ["owner", "admin", "operator", "viewer"],
        },
        {
          icon: BookOpen,
          label: "Kardex",
          href: `/${cedisId}/kardex`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: AlertTriangle,
          label: "Faltantes",
          href: `/${cedisId}/faltantes`,
          roles: ["owner", "admin", "operator"],
        },
      ],
    },
    {
      label: "Catálogos",
      items: [
        {
          icon: Package,
          label: "Insumos",
          href: `/${cedisId}/insumos`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: ChefHat,
          label: "Recetas",
          href: `/${cedisId}/recetas`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: Users,
          label: "Clientes",
          href: `/${cedisId}/clientes`,
          roles: ["owner", "admin", "operator"],
        },
        {
          icon: Truck,
          label: "Proveedores",
          href: `/${cedisId}/proveedores`,
          roles: ["owner", "admin", "operator"],
        },
      ],
    },
    {
      label: "Admin",
      items: [
        {
          icon: UserCog,
          label: "Usuarios",
          href: `/${cedisId}/usuarios`,
          roles: ["owner", "admin"],
        },
        {
          icon: Settings,
          label: "Configuración",
          href: `/${cedisId}/configuracion`,
          roles: ["owner", "admin"],
        },
      ],
    },
  ]
}

interface SidebarProps {
  cedisId: string
  role: Role
}

export function Sidebar({ cedisId, role }: SidebarProps) {
  const pathname = usePathname()
  const navGroups = getNavGroups(cedisId)

  function isActive(href: string) {
    if (href === `/${cedisId}`) return pathname === href
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside
      data-sidebar
      aria-label="Navegación principal"
      className="flex h-full w-[220px] flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Brand */}
      <div className="flex h-14 items-center px-5 shrink-0">
        <Link
          href={`/${cedisId}`}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="cEdis — Ir al dashboard"
        >
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-primary-foreground leading-none">
              cE
            </span>
          </div>
          <span className="font-semibold text-[15px] text-sidebar-foreground tracking-tight select-none">
            cEdis
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin px-3">
        <div className="space-y-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.label}>
                <p className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/40 select-none">
                  {group.label}
                </p>
                <ul role="list" className="space-y-px">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition-colors duration-100",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent font-normal"
                          )}
                        >
                          <Icon className="h-[15px] w-[15px] shrink-0" aria-hidden />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-sidebar-border px-5 py-3">
        <p className="text-[10px] font-medium text-sidebar-foreground/30 uppercase tracking-wider select-none">
          cEdis v1.0
        </p>
      </div>
    </aside>
  )
}
