"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  UserPlus,
  MoreHorizontal,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { InviteModal } from "@/components/usuarios/invite-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useUsuarios,
  useInvitaciones,
  useRemoveUsuario,
  useResendInvitacion,
  useRevokeInvitacion,
  useChangeRole,
} from "@/hooks/use-usuarios"
import { ROLE_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/utils/format"
import type { CedisMember, Invitation } from "@/types/app.types"
import type { Role } from "@/lib/constants"

export default function UsuariosPage() {
  const { cedisId } = useParams<{ cedisId: string }>()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<CedisMember | null>(null)

  const { data: membersRes, isLoading: loadingMembers } = useUsuarios(cedisId)
  const { data: invitesRes, isLoading: loadingInvites } = useInvitaciones(cedisId)
  const removeUsuario = useRemoveUsuario(cedisId)
  const resendInvite = useResendInvitacion(cedisId)
  const revokeInvite = useRevokeInvitacion(cedisId)
  const changeRole = useChangeRole(cedisId)

  const members = membersRes?.data ?? []
  const invitations = invitesRes?.data ?? []

  async function handleRemove() {
    if (!confirmRemove) return
    const r = await removeUsuario.mutateAsync(confirmRemove.user_id)
    if (r.error) { toast.error(r.error); return }
    toast.success("Usuario removido")
    setConfirmRemove(null)
  }

  async function handleChangeRole(userId: string, role: Role) {
    const r = await changeRole.mutateAsync({ userId, role })
    if (r.error) { toast.error(r.error); return }
    toast.success("Rol actualizado")
  }

  async function handleResend(inviteId: string) {
    const r = await resendInvite.mutateAsync(inviteId)
    if (r.error) { toast.error(r.error); return }
    toast.success("Invitacion reenviada")
  }

  async function handleRevoke(inviteId: string) {
    const r = await revokeInvite.mutateAsync(inviteId)
    if (r.error) { toast.error(r.error); return }
    toast.success("Invitacion revocada")
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Usuarios"
        description="Miembros del CEDIS e invitaciones pendientes"
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" aria-hidden />
            Invitar usuario
          </Button>
        }
      />

      {/* Members table */}
      <section>
        <h2 className="text-base font-semibold mb-3">Miembros activos</h2>
        {loadingMembers ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Miembro desde</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Sin miembros
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member: CedisMember) => {
                    const fullName = member.user?.full_name ?? member.user?.email ?? "—"
                    const email = member.user?.email ?? "—"
                    const initials = fullName.slice(0, 2).toUpperCase()
                    return (
                      <TableRow key={member.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-muted">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {fullName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ROLE_LABELS[member.role as Role] ?? member.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(member.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Acciones"
                              >
                                <MoreHorizontal className="h-4 w-4" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.role !== "admin" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangeRole(member.user_id, "admin")
                                  }
                                >
                                  Cambiar a Admin
                                </DropdownMenuItem>
                              )}
                              {member.role !== "viewer" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangeRole(member.user_id, "viewer")
                                  }
                                >
                                  Cambiar a Visualizador
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setConfirmRemove(member)}
                              >
                                <Trash2
                                  className="h-4 w-4 mr-2"
                                  aria-hidden
                                />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Pending invitations */}
      <section>
        <h2 className="text-base font-semibold mb-3">Invitaciones pendientes</h2>
        {loadingInvites ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin invitaciones pendientes.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((inv: Invitation) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm">{inv.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABELS[inv.role as Role] ?? inv.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(inv.expires_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResend(inv.id)}
                          disabled={resendInvite.isPending}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" aria-hidden />
                          Reenviar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRevoke(inv.id)}
                          disabled={revokeInvite.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" aria-hidden />
                          Revocar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        cedisId={cedisId}
      />

      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemove}
        title="Remover usuario"
        description={`Se removera a "${confirmRemove?.user?.full_name ?? confirmRemove?.user?.email}" del CEDIS.`}
        confirmLabel="Remover"
        loading={removeUsuario.isPending}
      />
    </div>
  )
}
