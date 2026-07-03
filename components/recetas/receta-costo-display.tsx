import { formatCurrency } from "@/lib/utils/format"

interface RecetaCostoDisplayProps {
  costo: number
  className?: string
}

export function RecetaCostoDisplay({ costo, className }: RecetaCostoDisplayProps) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        Costo teorico
      </p>
      <p className="font-mono text-lg font-semibold text-foreground">
        {formatCurrency(costo)}
      </p>
    </div>
  )
}
