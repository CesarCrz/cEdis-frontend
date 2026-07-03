export type UnitTipo = "peso" | "volumen" | "unidad"

export interface Unit {
  symbol: string
  name: string
  tipo: UnitTipo
  /** Factor to convert TO base unit (g for peso, mL for volumen, pza for unidad) */
  toBase: number
}

export const UNITS: Record<string, Unit> = {
  g:   { symbol: "g",   name: "Gramos",     tipo: "peso",    toBase: 1 },
  kg:  { symbol: "kg",  name: "Kilogramos", tipo: "peso",    toBase: 1000 },
  mg:  { symbol: "mg",  name: "Miligramos", tipo: "peso",    toBase: 0.001 },
  mL:  { symbol: "mL",  name: "Mililitros", tipo: "volumen", toBase: 1 },
  L:   { symbol: "L",   name: "Litros",     tipo: "volumen", toBase: 1000 },
  pza: { symbol: "pza", name: "Pieza",      tipo: "unidad",  toBase: 1 },
}

/**
 * Convert a quantity from one unit to another.
 * Both units must share the same tipo.
 */
export function convertUnit(
  quantity: number,
  fromSymbol: string,
  toSymbol: string
): number {
  if (fromSymbol === toSymbol) return quantity

  const from = UNITS[fromSymbol]
  const to = UNITS[toSymbol]

  if (!from || !to) throw new Error(`Unknown unit: ${fromSymbol} or ${toSymbol}`)
  if (from.tipo !== to.tipo) {
    throw new Error(`Cannot convert between ${from.tipo} and ${to.tipo}`)
  }

  return (quantity * from.toBase) / to.toBase
}

export function getUnitsByTipo(tipo: UnitTipo): Unit[] {
  return Object.values(UNITS).filter((u) => u.tipo === tipo)
}
