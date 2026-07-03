"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useCedisStore } from "@/store/cedis-store"

export function useCedis() {
  const params = useParams()
  const router = useRouter()
  const { activeCedisId, activeCedisName, setActiveCedis } = useCedisStore()

  const cedisIdFromUrl = params?.cedisId as string | undefined

  // Keep zustand in sync with URL
  useEffect(() => {
    if (cedisIdFromUrl && cedisIdFromUrl !== activeCedisId) {
      setActiveCedis(cedisIdFromUrl)
    }
  }, [cedisIdFromUrl, activeCedisId, setActiveCedis])

  const cedisId = cedisIdFromUrl ?? activeCedisId

  function navigateToCedis(id: string, name?: string) {
    setActiveCedis(id, name)
    router.push(`/${id}/dashboard`)
  }

  return {
    cedisId,
    cedisName: activeCedisName,
    navigateToCedis,
  }
}
