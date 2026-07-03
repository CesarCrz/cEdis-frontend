import { apiClient } from "./client"
import type { Proveedor } from "@/types/app.types"

export interface ProveedoresParams {
  search?: string
  page?: number
  pageSize?: number
}

export async function getProveedores(cedisId: string, params?: ProveedoresParams) {
  return apiClient<Proveedor[]>(`/api/${cedisId}/proveedores`, {
    params: params as Record<string, string | number | boolean | undefined>,
  })
}

export async function getProveedor(cedisId: string, id: string) {
  return apiClient<Proveedor>(`/api/${cedisId}/proveedores/${id}`)
}

export async function createProveedor(cedisId: string, data: unknown) {
  return apiClient<Proveedor>(`/api/${cedisId}/proveedores`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateProveedor(
  cedisId: string,
  id: string,
  data: unknown
) {
  return apiClient<Proveedor>(`/api/${cedisId}/proveedores/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteProveedor(cedisId: string, id: string) {
  return apiClient<{ success: boolean }>(`/api/${cedisId}/proveedores/${id}`, {
    method: "DELETE",
  })
}
