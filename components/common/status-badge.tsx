import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = "entrada" | "ticket"

const ENTRADA_STATUS: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "text-slate-600 bg-slate-100 border-slate-200",
  },
  confirmed: {
    label: "Confirmada",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelada",
    className: "text-red-600 bg-red-50 border-red-200",
  },
}

const TICKET_STATUS: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "text-slate-600 bg-slate-100 border-slate-200",
  },
  confirmed: {
    label: "Confirmado",
    className: "text-amber-700 bg-amber-50 border-amber-200",
  },
  delivered: {
    label: "Entregado",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  cancelled: {
    label: "Cancelado",
    className: "text-red-600 bg-red-50 border-red-200",
  },
}

interface StatusBadgeProps {
  status: string
  tipo: StatusType
  className?: string
}

export function StatusBadge({ status, tipo, className }: StatusBadgeProps) {
  const map = tipo === "entrada" ? ENTRADA_STATUS : TICKET_STATUS
  const config = map[status] ?? {
    label: status,
    className: "text-muted-foreground bg-muted border-border",
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
