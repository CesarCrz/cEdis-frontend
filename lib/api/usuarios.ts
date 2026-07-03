import { apiClient } from "./client"
import type { CedisMember, Invitation } from "@/types/app.types"
import type { Role } from "@/lib/constants"

export const usuariosApi = {
  listMembers: (cedisId: string) =>
    apiClient<CedisMember[]>(`/api/${cedisId}/usuarios/members`),

  listInvitations: (cedisId: string) =>
    apiClient<Invitation[]>(`/api/${cedisId}/usuarios/invitations`),

  invite: (cedisId: string, data: { email: string; role: Role }) =>
    apiClient<Invitation>(`/api/${cedisId}/usuarios/invite`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  changeRole: (cedisId: string, userId: string, role: Role) =>
    apiClient<CedisMember>(`/api/${cedisId}/usuarios/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  remove: (cedisId: string, userId: string) =>
    apiClient<{ success: boolean }>(`/api/${cedisId}/usuarios/${userId}`, {
      method: "DELETE",
    }),

  resendInvitation: (cedisId: string, invitationId: string) =>
    apiClient<Invitation>(
      `/api/${cedisId}/usuarios/invitations/${invitationId}/resend`,
      { method: "POST" }
    ),

  revokeInvitation: (cedisId: string, invitationId: string) =>
    apiClient<{ success: boolean }>(
      `/api/${cedisId}/usuarios/invitations/${invitationId}`,
      { method: "DELETE" }
    ),
}
