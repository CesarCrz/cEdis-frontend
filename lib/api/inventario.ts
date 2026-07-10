import { apiClient } from "./client"
import type { InventarioItem } from "@/types/app.types"

export interface AjusteManualData {
  insumo_id: string
  cantidad_nueva: number
  motivo: string
}

interface RawInventarioItem {
  id: string
  nombre: string
  sku?: string | null
  stock_actual: number | string
  stock_minimo: number | string
  costo_unitario?: number | string | null
  unidad?: { id: string; simbolo: string } | null
  categoria?: { id: string; nombre: string } | null
  semaforo: "ok" | "warn" | "low" | "critical"
}

export interface SucursalItem {
  insumo_id: string
  nombre: string
  sku: string | null | undefined
  unidad: { id: string; simbolo: string } | null
  entregado: number
  consumido: number
  ajuste_neto: number
  stock_calculado: number
}

interface InventarioResponse {
  cedis?: RawInventarioItem[]
  sucursales?: Array<{
    cliente_id: string
    nombre: string
    items: SucursalItem[]
  }>
}

function transformItem(item: RawInventarioItem): InventarioItem {
  const stock = Number(item.stock_actual)
  const costo = Number(item.costo_unitario ?? 0)
  return {
    insumo_id: item.id,
    nombre: item.nombre,
    sku: item.sku,
    categoria_nombre: item.categoria?.nombre,
    unidad_simbolo: item.unidad?.simbolo ?? "",
    stock_actual: stock,
    stock_minimo: Number(item.stock_minimo),
    costo_unitario: costo,
    valor_total: stock * costo,
    semaforo: item.semaforo,
  }
}

export const inventarioApi = {
  list: async (cedisId: string, params?: { cliente_id?: string }): Promise<{ data: InventarioItem[] | null; error: string | null }> => {
    const res = await apiClient<InventarioResponse>(`/api/${cedisId}/inventario`, {
      params: { tipo: "cedis", ...params } as Record<string, string | number | boolean | undefined>,
    })
    if (res.error || !res.data) return { data: null, error: res.error }
    const items = (res.data.cedis ?? []).map(transformItem)
    return { data: items, error: null }
  },

  listSucursal: async (cedisId: string, clienteId: string): Promise<{ data: SucursalItem[] | null; error: string | null }> => {
    const res = await apiClient<InventarioResponse>(`/api/${cedisId}/inventario`, {
      params: { tipo: "sucursal", cliente_id: clienteId },
    })
    if (res.error || !res.data) return { data: null, error: res.error }
    const sucursal = (res.data.sucursales ?? [])[0]
    return { data: sucursal?.items ?? [], error: null }
  },

  ajusteManual: (cedisId: string, data: AjusteManualData) =>
    apiClient<{ success: boolean }>(`/api/${cedisId}/inventario/ajuste`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
