import { apiClient } from "./client"
import type { UnidadMedida } from "@/types/app.types"

export async function getUnidadesMedida() {
  return apiClient<UnidadMedida[]>("/api/unidades-medida")
}
