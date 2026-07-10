import { cn } from "@/lib/utils"

interface KbdShortcutProps {
  keys: string
  className?: string
}

export function KbdShortcut({ keys, className }: KbdShortcutProps) {
  return (
    <kbd
      className={cn(
        "ml-1.5 inline-flex items-center justify-center rounded border border-white/30 bg-white/20 px-1 py-0.5 font-sans text-[10px] font-medium leading-none text-white/90 shadow-inner",
        className
      )}
    >
      {keys}
    </kbd>
  )
}
