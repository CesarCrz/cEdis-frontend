"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, Package2, Users, Truck, ChefHat } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useInsumos } from "@/hooks/use-insumos"
import { useClientes } from "@/hooks/use-clientes"
import { useProveedores } from "@/hooks/use-proveedores"
import { useRecetas } from "@/hooks/use-recetas"
import type { Insumo, Cliente, Proveedor, Receta } from "@/types/app.types"

// ─── Semaphore dot ────────────────────────────────────────────────────────────

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

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalSearch({ cedisId }: { cedisId: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  // Keyboard shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Data — only fetched once, cached by TanStack Query
  const { data: insumosData } = useInsumos(cedisId)
  const { data: clientesData } = useClientes(cedisId)
  const { data: proveedoresData } = useProveedores(cedisId)
  const { data: recetasData } = useRecetas(cedisId)

  const insumos: Insumo[] = insumosData?.data ?? []
  const clientes: Cliente[] = clientesData?.data ?? []
  const proveedores: Proveedor[] = proveedoresData?.data ?? []
  const recetas: Receta[] = recetasData?.data ?? []

  // Filtered results
  const filteredInsumos = useMemo(() => filterByQuery(insumos, query), [insumos, query])
  const filteredClientes = useMemo(() => filterByQuery(clientes, query), [clientes, query])
  const filteredProveedores = useMemo(
    () => filterByQuery(proveedores, query),
    [proveedores, query]
  )
  const filteredRecetas = useMemo(() => filterByQuery(recetas, query), [recetas, query])

  const hasResults =
    filteredInsumos.length +
      filteredClientes.length +
      filteredProveedores.length +
      filteredRecetas.length >
    0

  function navigate(path: string) {
    setOpen(false)
    setQuery("")
    router.push(path)
  }

  return (
    <>
      {/* Trigger button — shown in navbar */}
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

      {/* Command palette dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Buscar insumos, clientes, proveedores, recetas..."
          value={query}
          onValueChange={setQuery}
          aria-label="Campo de busqueda global"
        />
        <CommandList>
          {!hasResults && query.trim() !== "" && (
            <CommandEmpty>
              Sin resultados para &ldquo;{query}&rdquo;
            </CommandEmpty>
          )}

          {!hasResults && query.trim() === "" && (
            <CommandEmpty>
              Escribe para buscar...
            </CommandEmpty>
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
                      onSelect={() =>
                        navigate(`/${cedisId}/insumos`)
                      }
                      className="flex items-center gap-2"
                    >
                      <Package2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{insumo.nombre}</span>
                      {insumo.sku && (
                        <span className="font-mono text-xs text-muted-foreground shrink-0">
                          {insumo.sku}
                        </span>
                      )}
                      <span
                        className={cn("h-2 w-2 rounded-full shrink-0", semaforoColor[sem])}
                        aria-label={semaforoLabel[sem]}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {(filteredClientes.length > 0 ||
                filteredProveedores.length > 0 ||
                filteredRecetas.length > 0) && <CommandSeparator />}
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
                      <span className="font-mono text-xs text-muted-foreground shrink-0">
                        {cliente.codigo}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {(filteredProveedores.length > 0 || filteredRecetas.length > 0) && (
                <CommandSeparator />
              )}
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
