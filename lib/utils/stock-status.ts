export type StockLevel = "ok" | "warn" | "low" | "critical"

export function getStockLevel(stock: number, minimum: number): StockLevel {
  if (minimum === 0) return "ok"
  if (stock >= minimum) return "ok"
  if (stock >= minimum * 0.5) return "warn"
  if (stock > 0) return "low"
  return "critical"
}

export const stockLevelConfig = {
  ok: {
    label: "En stock",
    className: "text-stock-ok bg-stock-ok/10 border-stock-ok/20",
  },
  warn: {
    label: "Bajo",
    className: "text-stock-warn bg-stock-warn/10 border-stock-warn/20",
  },
  low: {
    label: "Muy bajo",
    className: "text-stock-low bg-stock-low/10 border-stock-low/20",
  },
  critical: {
    label: "Sin stock",
    className: "text-stock-critical bg-stock-critical/10 border-stock-critical/20",
  },
} as const
