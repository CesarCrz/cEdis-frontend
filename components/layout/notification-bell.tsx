"use client"

import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { useNotificaciones, useMarcarTodasLeidas } from "@/hooks/use-notificaciones"
import { formatRelativeTime } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  cedisId: string
}

export function NotificationBell({ cedisId }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const { data: res } = useNotificaciones(cedisId)
  const marcarTodas = useMarcarTodasLeidas(cedisId)

  const notificaciones = res?.data ?? []
  const unread = notificaciones.filter((n) => !n.leida).length

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
        aria-label={
          unread > 0
            ? `${unread} notificaciones sin leer`
            : "Notificaciones"
        }
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
          >
            {unread > 9 ? "9+" : unread}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Notificaciones</SheetTitle>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => marcarTodas.mutate()}
                  disabled={marcarTodas.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" aria-hidden />
                  Marcar todo leido
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {notificaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-30" aria-hidden />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <ul>
                {notificaciones.map((n, i) => (
                  <li key={n.id}>
                    <div
                      className={cn(
                        "px-4 py-3 transition-colors",
                        !n.leida && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.leida && (
                          <span
                            className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0"
                            aria-label="No leida"
                          />
                        )}
                        <div className={cn("min-w-0", n.leida && "pl-4")}>
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              n.leida && "text-muted-foreground"
                            )}
                          >
                            {n.titulo}
                          </p>
                          <p
                            className={cn(
                              "text-xs mt-0.5",
                              n.leida
                                ? "text-muted-foreground/60"
                                : "text-muted-foreground"
                            )}
                          >
                            {n.mensaje}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 mt-1">
                            {formatRelativeTime(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {i < notificaciones.length - 1 && <Separator />}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}
