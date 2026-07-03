"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/store/theme-store"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      if (mq.matches) root.classList.add("dark")
      else root.classList.remove("dark")
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add("dark")
        else root.classList.remove("dark")
      }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return <>{children}</>
}
