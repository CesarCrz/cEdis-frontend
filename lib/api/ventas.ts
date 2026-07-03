import { apiClient } from "./client"
import type { Ticket } from "@/types/app.types"

export interface VentasParams {
  status?: string
  cliente_id?: string
  desde?: string
  hasta?: string
  page?: number
  pageSize?: number
}

export interface CreateTicketData {
  cliente_id: string
  notas?: string
  items: {
    insumo_id: string
    cantidad: number
    unidad_id: string
    precio_unitario: number
  }[]
}

export interface BatchTicketData {
  cliente_ids: string[]
  items: {
    insumo_id: string
    cantidad: number
    unidad_id: string
    precio_unitario: number
  }[]
  overrides?: Record<
    string,
    {
      insumo_id: string
      cantidad: number
    }[]
  >
}

export const ventasApi = {
  list: (cedisId: string, params?: VentasParams) =>
    apiClient<Ticket[]>(`/api/${cedisId}/ventas`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (cedisId: string, id: string) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas/${id}`),

  create: (cedisId: string, data: CreateTicketData) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (cedisId: string, id: string, data: Partial<CreateTicketData>) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  confirmar: (cedisId: string, id: string) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas/${id}/confirmar`, {
      method: "POST",
    }),

  entregar: (cedisId: string, id: string) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas/${id}/entregar`, {
      method: "POST",
    }),

  cancel: (cedisId: string, id: string) =>
    apiClient<Ticket>(`/api/${cedisId}/ventas/${id}/cancel`, {
      method: "POST",
    }),

  batch: (cedisId: string, data: BatchTicketData) =>
    apiClient<{ created: number; tickets: Ticket[] }>(
      `/api/${cedisId}/ventas/batch`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),
}
