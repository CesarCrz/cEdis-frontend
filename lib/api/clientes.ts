import { apiClient } from "./client"
import type { Cliente } from "@/types/app.types"

export interface ClientesParams {
  search?: string
  page?: number
  pageSize?: number
}

export async function getClientes(cedisId: string, params?: ClientesParams) {
  return apiClient<Cliente[]>(`/api/${cedisId}/clientes`, {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getCliente(cedisId: string, id: string) {
  return apiClient<Cliente>(`/api/${cedisId}/clientes/${id}`)
}

export async function createCliente(cedisId: string, data: unknown) {
  return apiClient<Cliente>(`/api/${cedisId}/clientes`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateCliente(cedisId: string, id: string, data: unknown) {
  return apiClient<Cliente>(`/api/${cedisId}/clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteCliente(cedisId: string, id: string) {
  return apiClient<{ success: boolean }>(`/api/${cedisId}/clientes/${id}`, {
    method: "DELETE",
  })
}
