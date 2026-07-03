"use client"

import { Bell, LogOut, User, Menu, PanelLeft } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb } from "./breadcrumb"
import { GlobalSearch } from "@/components/common/global-search"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import type { Cedis } from "@/types/app.types"

interface NavbarProps {
  cedisList?: Cedis[]
  currentCedisId?: string
  onMenuToggle?: () => void
}

export function Navbar({
  currentCedisId,
  onMenuToggle,
}: NavbarProps) {
  const { user, signOut } = useAuth()

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "U"

  return (
    <header
      data-navbar
      className="h-14 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0"
    >
      <div className="flex h-full items-center gap-2 px-5">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 h-8 w-8 text-muted-foreground"
          onClick={onMenuToggle}
          aria-label="Abrir menu de navegacion"
        >
          <Menu className="h-4 w-4" aria-hidden />
        </Button>

        <PanelLeft
          className="hidden md:block h-4 w-4 text-muted-foreground/40 shrink-0 mr-1"
          aria-hidden
        />

        <div className="flex-1 min-w-0">
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-0.5">
          {currentCedisId && (
            <GlobalSearch cedisId={currentCedisId} />
          )}

          <ThemeToggle />

          {currentCedisId ? (
            <NotificationBell cedisId={currentCedisId} />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" aria-hidden />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 ml-1"
                aria-label="Menu de usuario"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Cuenta</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={signOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" aria-hidden />
                <span>Cerrar sesion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
