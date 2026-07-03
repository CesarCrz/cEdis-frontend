import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CedisStore {
  activeCedisId: string | null
  activeCedisName: string | null
  setActiveCedis: (id: string | null, name?: string | null) => void
}

export const useCedisStore = create<CedisStore>()(
  persist(
    (set) => ({
      activeCedisId: null,
      activeCedisName: null,
      setActiveCedis: (id, name = null) =>
        set({ activeCedisId: id, activeCedisName: name }),
    }),
    { name: "cedis-active" }
  )
)
