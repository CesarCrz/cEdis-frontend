"use client"

import { forwardRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value?: number | string
  onChange?: (value: number) => void
  decimals?: number
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onChange, decimals = 2, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [rawInput, setRawInput] = useState("")

    const numValue = typeof value === "string" ? parseFloat(value) || 0 : (value ?? 0)

    const formatted =
      numValue === 0
        ? "0"
        : new Intl.NumberFormat("es-MX", {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals,
          }).format(numValue)

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      setRawInput(numValue === 0 ? "" : String(numValue))
      setFocused(true)
      props.onFocus?.(e)
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      setFocused(false)
      props.onBlur?.(e)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value
      setRawInput(raw)
      const clean = raw.replace(/[^0-9.]/g, "")
      const num = parseFloat(clean)
      onChange?.(isNaN(num) ? 0 : num)
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={focused ? rawInput : formatted}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("font-mono", className)}
        {...props}
      />
    )
  }
)
NumericInput.displayName = "NumericInput"
