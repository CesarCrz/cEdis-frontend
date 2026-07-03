"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Plus, Warehouse } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCedisStore } from "@/store/cedis-store"
import { formatShortId } from "@/lib/utils/format"
import type { Cedis } from "@/types/app.types"

interface CedisSwitcherProps {
  cedisList: Cedis[]
  currentCedisId: string
}

export function CedisSwitcher({ cedisList, currentCedisId }: CedisSwitcherProps) {
  const router = useRouter()
  const { setActiveCedis } = useCedisStore()

  const current = cedisList.find((c) => c.id === currentCedisId)

  function handleSelect(cedis: Cedis) {
    setActiveCedis(cedis.id, cedis.nombre)
    router.push(`/${cedis.id}/dashboard`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 px-2 max-w-[200px]"
          aria-label="Cambiar CEDIS activo"
        >
          <Warehouse className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium text-sm">
            {current?.nombre ?? "CEDIS"}
          </span>
          {current && (
            <span className="font-mono-data text-xs text-muted-foreground hidden sm:inline">
              {formatShortId(current.id)}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {cedisList.map((cedis) => (
          <DropdownMenuItem
            key={cedis.id}
            onClick={() => handleSelect(cedis)}
            className={cn(
              "flex flex-col items-start gap-0.5 cursor-pointer",
              cedis.id === currentCedisId && "bg-accent"
            )}
          >
            <span className="font-medium text-sm">{cedis.nombre}</span>
            <span className="font-mono-data text-xs text-muted-foreground">
              {formatShortId(cedis.id)}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/cedis/nuevo")}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden />
          <span className="text-sm">Crear nuevo CEDIS</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
