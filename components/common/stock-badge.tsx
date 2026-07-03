import { Badge } from "@/components/ui/badge"
import {
  getStockLevel,
  stockLevelConfig,
} from "@/lib/utils/stock-status"
import { formatQuantity } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface StockBadgeProps {
  stock: number
  minimum: number
  unit: string
  showQuantity?: boolean
  className?: string
}

export function StockBadge({
  stock,
  minimum,
  unit,
  showQuantity = true,
  className,
}: StockBadgeProps) {
  const level = getStockLevel(stock, minimum)
  const config = stockLevelConfig[level]

  return (
    <Badge
      variant="outline"
      className={cn(config.className, "font-medium text-xs", className)}
    >
      {config.label}
      {showQuantity && (
        <span className="ml-1 font-mono-data opacity-75">
          ({formatQuantity(stock, unit)})
        </span>
      )}
    </Badge>
  )
}
