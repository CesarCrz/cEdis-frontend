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
import { getUnitsByTipo, UNITS, type UnitTipo } from "@/lib/utils/unit-conversion"

interface UnitSelectorProps {
  value: string
  onChange: (value: string) => void
  tipo?: UnitTipo
  disabled?: boolean
  placeholder?: string
}

const TIPO_LABELS: Record<UnitTipo, string> = {
  peso: "Peso",
  volumen: "Volumen",
  unidad: "Unidad",
}

const TIPOS: UnitTipo[] = ["peso", "volumen", "unidad"]

export function UnitSelector({
  value,
  onChange,
  tipo,
  disabled = false,
  placeholder = "Unidad",
}: UnitSelectorProps) {
  const grouped = tipo
    ? { [tipo]: getUnitsByTipo(tipo) }
    : Object.fromEntries(TIPOS.map((t) => [t, getUnitsByTipo(t)]))

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Seleccionar unidad de medida">
        <SelectValue placeholder={placeholder}>
          {value ? UNITS[value]?.symbol ?? value : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(grouped).map(([t, units]) => (
          <SelectGroup key={t}>
            <SelectLabel>{TIPO_LABELS[t as UnitTipo]}</SelectLabel>
            {units.map((unit) => (
              <SelectItem key={unit.symbol} value={unit.symbol}>
                <span className="font-mono-data">{unit.symbol}</span>
                <span className="ml-2 text-muted-foreground text-xs">
                  {unit.name}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
