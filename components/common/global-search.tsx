"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Package2,
  Users,
  Truck,
  ChefHat,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Plus,
  FileDown,
  Receipt,
  UserCog,
  Boxes,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useInsumos } from "@/hooks/use-insumos"
import { useClientes } from "@/hooks/use-clientes"
import { useProveedores } from "@/hooks/use-proveedores"
import { useRecetas } from "@/hooks/use-recetas"
import type { Insumo, Cliente, Proveedor, Receta } from "@/types/app.types"

// ─── Types ────────────────────────────────────────────────────────────────────

type Semaforo = "ok" | "warn" | "low" | "critical"

function getSemaforo(insumo: Insumo): Semaforo {
  if (insumo.stock_actual <= 0) return "critical"
  if (insumo.stock_actual <= insumo.stock_minimo * 0.5) return "critical"
  if (insumo.stock_actual <= insumo.stock_minimo) return "low"
  if (insumo.stock_actual <= insumo.stock_minimo * 1.5) return "warn"
  return "ok"
}

const semaforoColor: Record<Semaforo, string> = {
  ok: "bg-[var(--stock-ok)]",
  warn: "bg-[var(--stock-warn)]",
  low: "bg-[var(--stock-low)]",
  critical: "bg-[var(--stock-critical)]",
}

const semaforoLabel: Record<Semaforo, string> = {
  ok: "Stock ok",
  warn: "Stock bajo aviso",
  low: "Stock bajo",
  critical: "Stock critico",
}

// ─── Navigation items ─────────────────────────────────────────────────────────

interface NavItem {
  label: string
  keywords: string[]
  path: string
  icon: React.ElementType
  shortcut?: string
}

function getNavItems(cedisId: string): NavItem[] {
  return [
    {
      label: "Dashboard",
      keywords: ["dashboard", "inicio", "home", "resumen", "panel"],
      path: `/${cedisId}/dashboard`,
      icon: LayoutDashboard,
      shortcut: "G D",
    },
    {
      label: "Insumos",
      keywords: ["insumos", "ingredientes", "materiales", "inventario", "productos"],
      path: `/${cedisId}/insumos`,
      icon: Package2,
      shortcut: "G I",
    },
    {
      label: "Recetas",
      keywords: ["recetas", "receta", "menu", "platillos", "preparaciones"],
      path: `/${cedisId}/recetas`,
      icon: ChefHat,
    },
    {
      label: "Entradas",
      keywords: ["entradas", "entrada", "compras", "recepciones", "proveedor"],
      path: `/${cedisId}/entradas`,
      icon: ClipboardList,
    },
    {
      label: "Ventas",
      keywords: ["ventas", "venta", "pedidos", "ordenes", "tickets"],
      path: `/${cedisId}/ventas`,
      icon: ShoppingCart,
      shortcut: "G V",
    },
    {
      label: "Ventas Declaradas",
      keywords: ["ventas declaradas", "declaradas", "declaracion"],
      path: `/${cedisId}/ventas-declaradas`,
      icon: Receipt,
    },
    {
      label: "Inventario",
      keywords: ["inventario", "ajuste", "stock", "existencias"],
      path: `/${cedisId}/inventario`,
      icon: Boxes,
    },
    {
      label: "Kardex",
      keywords: ["kardex", "movimientos", "historial", "trazabilidad"],
      path: `/${cedisId}/kardex`,
      icon: BarChart3,
    },
    {
      label: "Faltantes",
      keywords: ["faltantes", "faltante", "alertas", "stock bajo"],
      path: `/${cedisId}/faltantes`,
      icon: AlertTriangle,
    },
    {
      label: "Clientes",
      keywords: ["clientes", "cliente", "canales", "distribuidores"],
      path: `/${cedisId}/clientes`,
      icon: Users,
    },
    {
      label: "Proveedores",
      keywords: ["proveedores", "proveedor", "suppliers"],
      path: `/${cedisId}/proveedores`,
      icon: Truck,
    },
    {
      label: "Usuarios",
      keywords: ["usuarios", "equipo", "miembros", "permisos", "roles"],
      path: `/${cedisId}/usuarios`,
      icon: UserCog,
    },
  ]
}

interface QuickAction {
  label: string
  keywords: string[]
  path: string
  icon: React.ElementType
}

function getQuickActions(cedisId: string): QuickAction[] {
  return [
    {
      label: "Nuevo insumo",
      keywords: ["nuevo insumo", "crear insumo", "agregar insumo"],
      path: `/${cedisId}/insumos?nuevo=1`,
      icon: Plus,
    },
    {
      label: "Nueva receta",
      keywords: ["nueva receta", "crear receta", "agregar receta"],
      path: `/${cedisId}/recetas?nuevo=1`,
      icon: Plus,
    },
    {
      label: "Nueva entrada",
      keywords: ["nueva entrada", "crear entrada", "registrar compra"],
      path: `/${cedisId}/entradas?nuevo=1`,
      icon: Plus,
    },
    {
      label: "Nueva venta",
      keywords: ["nueva venta", "crear venta", "nuevo pedido"],
      path: `/${cedisId}/ventas?nuevo=1`,
      icon: Plus,
    },
    {
      label: "Importar insumos CSV",
      keywords: ["importar", "csv", "import", "carga masiva"],
      path: `/${cedisId}/insumos?import=1`,
      icon: FileDown,
    },
    {
      label: "Ver recetario",
      keywords: ["recetario", "todas recetas", "menu completo"],
      path: `/${cedisId}/recetas`,
      icon: BookOpen,
    },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filterByQuery<T extends { nombre: string }>(
  items: T[] | undefined,
  query: string,
  max = 5
): T[] {
  if (!items) return []
  const q = query.toLowerCase().trim()
  if (!q) return items.slice(0, max)
  return items
    .filter((item) => item.nombre.toLowerCase().includes(q))
    .slice(0, max)
}

function filterNavItems<T extends { label: string; keywords: string[] }>(
  items: T[],
  query: string
): T[] {
  const q = query.toLowerCase().trim()
  if (!q) return items
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSearch({ cedisId }: { cedisId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const { data: insumosData } = useInsumos(cedisId)
  const { data: clientesData } = useClientes(cedisId)
  const { data: proveedoresData } = useProveedores(cedisId)
  const { data: recetasData } = useRecetas(cedisId)

  const insumos: Insumo[] = insumosData?.data ?? []
  const clientes: Cliente[] = clientesData?.data ?? []
  const proveedores: Proveedor[] = proveedoresData?.data ?? []
  const recetas: Receta[] = recetasData?.data ?? []

  const navItems = useMemo(() => getNavItems(cedisId), [cedisId])
  const quickActions = useMemo(() => getQuickActions(cedisId), [cedisId])

  const filteredNav = useMemo(() => filterNavItems(navItems, query), [navItems, query])
  const filteredActions = useMemo(() => filterNavItems(quickActions, query), [quickActions, query])
  const filteredInsumos = useMemo(() => filterByQuery(insumos, query), [insumos, query])
  const filteredClientes = useMemo(() => filterByQuery(clientes, query), [clientes, query])
  const filteredProveedores = useMemo(() => filterByQuery(proveedores, query), [proveedores, query])
  const filteredRecetas = useMemo(() => filterByQuery(recetas, query), [recetas, query])

  const hasDataResults =
    filteredInsumos.length + filteredClientes.length + filteredProveedores.length + filteredRecetas.length > 0

  function navigate(path: string) {
    setOpen(false)
    setQuery("")
    router.push(path)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground h-8 px-3 rounded-md border border-border bg-muted/50"
        aria-label="Buscar (Ctrl+K)"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" aria-hidden />
        <span className="text-xs">Buscar...</span>
        <kbd className="ml-2 hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1.5 text-[10px] font-medium">
          <span>Ctrl</span>
          <span className="mx-0.5">K</span>
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery("") }}>
        <CommandInput
          placeholder="Buscar o navegar..."
          value={query}
          onValueChange={setQuery}
          aria-label="Busqueda global"
        />
        <CommandList>
          {/* Empty state only when there are no matches at all */}
          {!hasDataResults && filteredNav.length === 0 && filteredActions.length === 0 && query.trim() !== "" && (
            <CommandEmpty>Sin resultados para &ldquo;{query}&rdquo;</CommandEmpty>
          )}

          {/* Navegación */}
          {filteredNav.length > 0 && (
            <>
              <CommandGroup heading="Navegar a">
                {filteredNav.map((item) => (
                  <CommandItem
                    key={item.path}
                    value={`nav-${item.label}-${item.keywords.join("-")}`}
                    onSelect={() => navigate(item.path)}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut ? (
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    ) : (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {(filteredActions.length > 0 || hasDataResults) && <CommandSeparator />}
            </>
          )}

          {/* Acciones rápidas */}
          {filteredActions.length > 0 && (
            <>
              <CommandGroup heading="Acciones rapidas">
                {filteredActions.map((action) => (
                  <CommandItem
                    key={`action-${action.label}`}
                    value={`action-${action.label}-${action.keywords.join("-")}`}
                    onSelect={() => navigate(action.path)}
                    className="flex items-center gap-2"
                  >
                    <action.icon className="h-4 w-4 text-primary shrink-0" aria-hidden />
                    <span className="flex-1">{action.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" aria-hidden />
                  </CommandItem>
                ))}
              </CommandGroup>
              {hasDataResults && <CommandSeparator />}
            </>
          )}

          {/* Insumos */}
          {filteredInsumos.length > 0 && (
            <>
              <CommandGroup heading="Insumos">
                {filteredInsumos.map((insumo) => {
                  const sem = getSemaforo(insumo)
                  return (
                    <CommandItem
                      key={insumo.id}
                      value={`insumo-${insumo.id}-${insumo.nombre}`}
                      onSelect={() => navigate(`/${cedisId}/insumos`)}
                      className="flex items-center gap-2"
                    >
                      <Package2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{insumo.nombre}</span>
                      {insumo.sku && (
                        <span className="font-mono text-xs text-muted-foreground shrink-0">{insumo.sku}</span>
                      )}
                      <span
                        className={cn("h-2 w-2 rounded-full shrink-0", semaforoColor[sem])}
                        aria-label={semaforoLabel[sem]}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {(filteredClientes.length > 0 || filteredProveedores.length > 0 || filteredRecetas.length > 0) && (
                <CommandSeparator />
              )}
            </>
          )}

          {/* Clientes */}
          {filteredClientes.length > 0 && (
            <>
              <CommandGroup heading="Clientes">
                {filteredClientes.map((cliente) => (
                  <CommandItem
                    key={cliente.id}
                    value={`cliente-${cliente.id}-${cliente.nombre}`}
                    onSelect={() => navigate(`/${cedisId}/clientes`)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{cliente.nombre}</span>
                    {cliente.codigo && (
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{cliente.codigo}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {(filteredProveedores.length > 0 || filteredRecetas.length > 0) && <CommandSeparator />}
            </>
          )}

          {/* Proveedores */}
          {filteredProveedores.length > 0 && (
            <>
              <CommandGroup heading="Proveedores">
                {filteredProveedores.map((prov) => (
                  <CommandItem
                    key={prov.id}
                    value={`proveedor-${prov.id}-${prov.nombre}`}
                    onSelect={() => navigate(`/${cedisId}/proveedores`)}
                    className="flex items-center gap-2"
                  >
                    <Truck className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                    <span className="flex-1 truncate">{prov.nombre}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredRecetas.length > 0 && <CommandSeparator />}
            </>
          )}

          {/* Recetas */}
          {filteredRecetas.length > 0 && (
            <CommandGroup heading="Recetas">
              {filteredRecetas.map((receta) => (
                <CommandItem
                  key={receta.id}
                  value={`receta-${receta.id}-${receta.nombre}`}
                  onSelect={() => navigate(`/${cedisId}/recetas`)}
                  className="flex items-center gap-2"
                >
                  <ChefHat className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{receta.nombre}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
