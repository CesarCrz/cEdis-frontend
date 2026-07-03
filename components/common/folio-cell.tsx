"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface FolioCellProps {
  folio: string
  className?: string
}

export function FolioCell({ folio, className }: FolioCellProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(folio).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 font-mono text-xs text-muted-foreground",
        "hover:text-foreground transition-colors group",
        className
      )}
      aria-label={`Copiar folio ${folio}`}
    >
      <span>{folio}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600 shrink-0" aria-hidden />
      ) : (
        <Copy
          className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          aria-hidden
        />
      )}
    </button>
  )
}
