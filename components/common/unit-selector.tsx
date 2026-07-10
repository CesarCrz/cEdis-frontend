"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUnidadesMedida } from "@/hooks/use-uom"
import type { UnidadMedida } from "@/types/app.types"

interface UnitSelectorProps {
  value: string
  onChange: (value: string) => void
  tipo?: UnidadMedida["tipo"]
  disabled?: boolean
  placeholder?: string
}

const TIPO_LABELS: Record<UnidadMedida["tipo"], string> = {
  peso: "Peso",
  volumen: "Volumen",
  unidad: "Unidad",
}

const TIPO_ORDER: UnidadMedida["tipo"][] = ["peso", "volumen", "unidad"]

export function UnitSelector({
  value,
  onChange,
  tipo,
  disabled = false,
  placeholder = "Unidad",
}: UnitSelectorProps) {
  const { data: res, isLoading } = useUnidadesMedida()
  const all: UnidadMedida[] = res?.data ?? []

  const filtered = tipo ? all.filter((u) => u.tipo === tipo) : all
  const grouped = TIPO_ORDER.reduce<Record<string, UnidadMedida[]>>((acc, t) => {
    const units = filtered.filter((u) => u.tipo === t)
    if (units.length) acc[t] = units
    return acc
  }, {})

  const selected = all.find((u) => u.id === value)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger aria-label="Seleccionar unidad de medida">
        <SelectValue placeholder={isLoading ? "Cargando..." : placeholder}>
          {selected ? (
            <span>
              <span className="font-mono-data">{selected.simbolo}</span>
              <span className="ml-1 text-muted-foreground text-xs">{selected.nombre}</span>
            </span>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(grouped).map(([t, units]) => (
          <SelectGroup key={t}>
            <SelectLabel>{TIPO_LABELS[t as UnidadMedida["tipo"]]}</SelectLabel>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                <span className="font-mono-data">{unit.simbolo}</span>
                <span className="ml-2 text-muted-foreground text-xs">{unit.nombre}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
