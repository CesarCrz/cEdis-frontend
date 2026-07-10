import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Role } from "@/lib/constants"

interface CedisStore {
  activeCedisId: string | null
  activeCedisName: string | null
  activeRole: Role
  setActiveCedis: (id: string | null, name?: string | null, role?: Role) => void
}

export const useCedisStore = create<CedisStore>()(
  persist(
    (set) => ({
      activeCedisId: null,
      activeCedisName: null,
      activeRole: "viewer",
      setActiveCedis: (id, name = null, role = "viewer") =>
        set({ activeCedisId: id, activeCedisName: name, activeRole: role }),
    }),
    { name: "cedis-active" }
  )
)
