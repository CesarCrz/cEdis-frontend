export const UOM_SYMBOLS: Record<string, string> = {
  g: "g",
  kg: "kg",
  mg: "mg",
  mL: "mL",
  L: "L",
  pza: "pza",
}

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  OPERATOR: "operator",
  VIEWER: "viewer",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Propietario",
  admin: "Administrador",
  operator: "Operador",
  viewer: "Visualizador",
}

export const TICKET_STATUS = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
} as const

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS]

export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Borrador",
    className: "text-status-draft bg-status-draft/10 border-status-draft/20",
  },
  confirmed: {
    label: "Confirmado",
    className:
      "text-status-confirmed bg-status-confirmed/10 border-status-confirmed/20",
  },
  delivered: {
    label: "Entregado",
    className:
      "text-status-delivered bg-status-delivered/10 border-status-delivered/20",
  },
}

export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  CEDIS: "/cedis",
  CEDIS_NEW: "/cedis/nuevo",
  AUTH_CALLBACK: "/auth/callback",
  dashboard: (cedisId: string) => `/${cedisId}/dashboard`,
  entradas: (cedisId: string) => `/${cedisId}/entradas`,
  ventas: (cedisId: string) => `/${cedisId}/ventas`,
  ventasDeclaradas: (cedisId: string) => `/${cedisId}/ventas-declaradas`,
  clientes: (cedisId: string) => `/${cedisId}/clientes`,
  insumos: (cedisId: string) => `/${cedisId}/insumos`,
  recetas: (cedisId: string) => `/${cedisId}/recetas`,
  inventario: (cedisId: string) => `/${cedisId}/inventario`,
  kardex: (cedisId: string) => `/${cedisId}/kardex`,
  faltantes: (cedisId: string) => `/${cedisId}/faltantes`,
  proveedores: (cedisId: string) => `/${cedisId}/proveedores`,
  usuarios: (cedisId: string) => `/${cedisId}/usuarios`,
  configuracion: (cedisId: string) => `/${cedisId}/configuracion`,
} as const

export const VIEWER_ALLOWED_PATHS = ["/inventario"]

export const PUBLIC_ROUTES = ["/", "/login", "/auth", "/invite"]
