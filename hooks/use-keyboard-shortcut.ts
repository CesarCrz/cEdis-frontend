"use client"

import { useEffect } from "react"

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    function handler(e: KeyboardEvent) {
      if (!enabled) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement
      if (INPUT_TAGS.has(target.tagName)) return
      if (target.isContentEditable) return
      if (target.closest('[role="dialog"]') && INPUT_TAGS.has(target.tagName)) return
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      e.preventDefault()
      callback()
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [key, callback, enabled])
}
