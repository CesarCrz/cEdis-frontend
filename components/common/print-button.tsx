"use client"

import { Printer, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { printWithFormat, PRINT_FORMAT_OPTIONS, type PrintFormat } from "@/lib/utils/print"

interface PrintButtonProps {
  className?: string
}

export function PrintButton({ className }: PrintButtonProps) {
  function handleSelect(format: PrintFormat) {
    printWithFormat(format)
  }

  return (
    <div className={`flex items-center ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        className="rounded-r-none border-r-0 pr-2.5"
        onClick={() => printWithFormat("full")}
      >
        <Printer className="h-4 w-4 mr-1.5" aria-hidden />
        Imprimir
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-l-none px-1.5"
            aria-label="Seleccionar formato de impresión"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {PRINT_FORMAT_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => handleSelect(opt.value)}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
