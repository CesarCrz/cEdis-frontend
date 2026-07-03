"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { usuariosApi } from "@/lib/api/usuarios"
import type { Role } from "@/lib/constants"

export function useUsuarios(cedisId: string) {
  return useQuery({
    queryKey: ["usuarios-members", cedisId],
    queryFn: () => usuariosApi.listMembers(cedisId),
    enabled: !!cedisId,
  })
}

export function useInvitaciones(cedisId: string) {
  return useQuery({
    queryKey: ["invitaciones", cedisId],
    queryFn: () => usuariosApi.listInvitations(cedisId),
    enabled: !!cedisId,
  })
}

export function useInviteUsuario(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; role: Role }) =>
      usuariosApi.invite(cedisId, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["invitaciones", cedisId] }),
  })
}

export function useChangeRole(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      usuariosApi.changeRole(cedisId, userId, role),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["usuarios-members", cedisId] }),
  })
}

export function useRemoveUsuario(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => usuariosApi.remove(cedisId, userId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["usuarios-members", cedisId] }),
  })
}

export function useResendInvitacion(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) =>
      usuariosApi.resendInvitation(cedisId, invitationId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["invitaciones", cedisId] }),
  })
}

export function useRevokeInvitacion(cedisId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (invitationId: string) =>
      usuariosApi.revokeInvitation(cedisId, invitationId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["invitaciones", cedisId] }),
  })
}
