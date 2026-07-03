import type { Role, TicketStatus } from "@/lib/constants"

export interface Cedis {
  id: string
  nombre: string
  descripcion?: string | null
  created_at: string
  updated_at: string
}

export interface CedisMember {
  id: string
  cedis_id: string
  user_id: string
  role: Role
  created_at: string
  user?: UserProfile
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  created_at: string
}

export interface Categoria {
  id: string
  cedis_id: string
  nombre: string
  created_at: string
}

export interface UnidadMedida {
  id: string
  nombre: string
  simbolo: string
  tipo: "peso" | "volumen" | "unidad"
  factor_base: number
}

export interface PrecioHistorial {
  id: string
  insumo_id: string
  costo_unitario: number
  fecha: string
  registrado_por?: string | null
}

export interface Insumo {
  id: string
  cedis_id: string
  nombre: string
  sku?: string | null
  descripcion?: string | null
  categoria_id?: string | null
  categoria?: Categoria | null
  unidad_id?: string | null
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  costo_unitario?: number | null
  precio_unitario?: number | null
  proveedor_id?: string | null
  proveedor?: Proveedor | null
  activo: boolean
  created_at: string
  updated_at: string
  historial_precios?: PrecioHistorial[]
}

export interface Receta {
  id: string
  cedis_id: string
  nombre: string
  descripcion?: string | null
  unidad_rendimiento: string
  cantidad_rendimiento: number
  activo: boolean
  created_at: string
  updated_at: string
  ingredientes?: RecetaIngrediente[]
}

export interface RecetaIngrediente {
  id: string
  receta_id: string
  insumo_id: string
  cantidad: number
  unidad: string
  unidad_id?: string | null
  insumo?: Insumo
}

export interface Cliente {
  id: string
  cedis_id: string
  nombre: string
  codigo?: string | null
  direccion?: string | null
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Proveedor {
  id: string
  cedis_id: string
  nombre: string
  contacto?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  folio: string
  cedis_id: string
  cliente_id: string
  status: TicketStatus
  fecha_entrega?: string | null
  notas?: string | null
  total?: number | null
  creado_por?: string
  confirmado_por?: string | null
  entregado_por?: string | null
  confirmado_at?: string | null
  entregado_at?: string | null
  created_at: string
  updated_at: string
  cliente?: Cliente
  partidas?: TicketPartida[]
  items?: TicketItem[]
}

export interface TicketPartida {
  id: string
  ticket_id: string
  receta_id?: string | null
  insumo_id?: string | null
  descripcion: string
  cantidad: number
  unidad: string
  precio_unitario: number
  subtotal: number
  receta?: Receta
  insumo?: Insumo
}

export interface Entrada {
  id: string
  folio: string
  cedis_id: string
  proveedor_id?: string | null
  fecha: string
  status?: "draft" | "confirmed" | "cancelled"
  notas?: string | null
  total?: number | null
  total_costo?: number
  creado_por?: string
  confirmado_por?: string | null
  confirmado_at?: string | null
  created_at: string
  updated_at: string
  proveedor?: Proveedor
  partidas?: EntradaPartida[]
  items?: EntradaItem[]
}

export interface EntradaPartida {
  id: string
  entrada_id: string
  insumo_id: string
  cantidad: number
  unidad: string
  costo_unitario: number
  subtotal: number
  insumo?: Insumo
}

export interface MovimientoKardex {
  id: string
  cedis_id: string
  insumo_id: string
  tipo: "entrada" | "salida" | "ajuste"
  cantidad: number
  unidad: string
  saldo_anterior: number
  saldo_posterior: number
  referencia_tipo?: string | null
  referencia_id?: string | null
  notas?: string | null
  created_at: string
  insumo?: Insumo
}

export interface VentaDeclarada {
  id: string
  folio?: string
  cedis_id: string
  cliente_id: string
  canal_id?: string
  fecha: string
  periodo_inicio?: string
  periodo_fin?: string
  notas?: string | null
  creado_por?: string
  created_at: string
  cliente?: Cliente
  canal?: Pick<CanalVenta, "nombre">
  partidas?: VentaDeclaradaPartida[]
  items?: VentaDeclaradaItem[]
}

export interface VentaDeclaradaPartida {
  id: string
  venta_declarada_id: string
  receta_id: string
  cantidad: number
  unidad: string
  receta?: Receta
}

export interface Invitation {
  id: string
  token: string
  cedis_id: string
  email: string
  role: Role
  expires_at: string
  accepted_at?: string | null
  created_at: string
  cedis?: Cedis
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ─── Wave 3 additions ────────────────────────────────────────────────────────

export interface CanalVenta {
  id: string
  cedis_id: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  created_at: string
}

export type KardexTipo =
  | "entrada"
  | "salida_venta"
  | "ajuste_manual"
  | "venta_declarada"
  | "merma"

export interface EntradaItem {
  id: string
  insumo_id: string
  cantidad: number
  unidad_id: string
  costo_unitario: number
  insumo?: Pick<Insumo, "nombre" | "sku">
  unidad?: Pick<UnidadMedida, "nombre" | "simbolo">
}

export interface TicketItem {
  id: string
  ticket_id: string
  insumo_id: string
  cantidad: number
  unidad_id: string
  precio_unitario: number
  subtotal: number
  insumo?: Pick<Insumo, "nombre" | "sku">
  unidad?: Pick<UnidadMedida, "nombre" | "simbolo">
}

export interface VentaDeclaradaItem {
  id: string
  receta_id: string
  variacion_id?: string | null
  cantidad_vendida: number
  subtotal_consumo: number
  receta?: Pick<Receta, "nombre">
}

export interface KardexEntry {
  id: string
  cedis_id: string
  insumo_id: string
  tipo: KardexTipo
  cantidad: number
  unidad_id: string
  stock_antes: number
  stock_despues: number
  referencia_tipo?: string
  referencia_id?: string
  cliente_id?: string | null
  canal_id?: string | null
  usuario_id: string
  notas?: string
  created_at: string
  insumo?: Pick<Insumo, "nombre" | "sku">
  unidad?: Pick<UnidadMedida, "simbolo">
  cliente?: Pick<Cliente, "nombre">
  canal?: Pick<CanalVenta, "nombre">
  usuario?: { full_name: string }
}

export interface Faltante {
  insumo_id: string
  sku?: string
  nombre: string
  categoria_nombre?: string
  unidad_simbolo: string
  stock_actual: number
  stock_minimo: number
  faltante: number
  semaforo: "warn" | "low" | "critical"
  proveedor_nombre?: string
}

export interface DashboardData {
  kpis: {
    total_insumos: number
    valor_inventario: number
    tickets_pendientes: number
    entradas_periodo: number
  }
  faltantes_preview: Faltante[]
  ventas_por_dia: { fecha: string; total: number }[]
  top_insumos: { nombre: string; cantidad: number }[]
  ventas_por_canal: { canal: string; cantidad: number }[]
  actividad_reciente: {
    id: string
    tipo: string
    usuario_nombre: string
    created_at: string
    detalles?: unknown
  }[]
}

export interface Notificacion {
  id: string
  cedis_id: string
  user_id: string
  titulo: string
  mensaje: string
  leida: boolean
  created_at: string
}

export interface InventarioItem {
  insumo_id: string
  nombre: string
  sku?: string | null
  categoria_nombre?: string
  unidad_simbolo: string
  stock_actual: number
  stock_minimo: number
  costo_unitario: number
  valor_total: number
  semaforo: "ok" | "warn" | "low" | "critical"
}

export interface Merma {
  id: string
  cedis_id: string
  insumo_id: string
  cantidad: number
  unidad_id: string
  motivo: string
  creado_por: string
  created_at: string
  insumo?: Pick<Insumo, "nombre" | "sku">
  unidad?: Pick<UnidadMedida, "simbolo">
}
