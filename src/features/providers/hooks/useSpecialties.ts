import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { SPECIALTY_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { PaginatedResponse } from '@/types/api'

/**
 * Tipo mínimo de una specialty — solo lo necesario para el dropdown.
 * No importamos desde otra feature para mantener providers autocontenido.
 */
export interface Specialty {
  id: string
  name: string
}

interface UseSpecialtiesReturn {
  specialties: Specialty[]
  isLoading: boolean
}

/**
 * Hook que obtiene la lista de specialties para los dropdowns de filtros.
 *
 * A diferencia de `useProviders`, este hook NO expone una función pública
 * de re-fetch porque la lista de specialties no cambia con filtros —
 * solo se carga una vez al montar el componente.
 *
 * Se pide con `limit: 50` que es el máximo — hay pocas specialties
 * en el sistema (4-5), así que una sola página es suficiente.
 */
export function useSpecialties(): UseSpecialtiesReturn {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchSpecialties() {
      try {
        const { data } = await apiClient.get<PaginatedResponse<Specialty>>(
          SPECIALTY_ENDPOINTS.LIST,
          { params: { limit: 50 } },
        )

        if (!cancelled) {
          setSpecialties(data.data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = isApiError(err) ? err.message : 'Failed to load specialties'
          console.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchSpecialties()

    return () => {
      cancelled = true
    }
  }, [])

  return { specialties, isLoading }
}
