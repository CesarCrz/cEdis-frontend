"use client"

import { useEffect, useState } from "react"

/**
 * Delay propagating a fast-changing value (a search box) so it can be used as
 * a query key without firing a request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])

  return debounced
}
