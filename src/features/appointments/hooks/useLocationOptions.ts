import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { LOCATION_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { PaginatedResponse } from '@/types/api'

/**
 * Tipo mínimo de una location — solo lo necesario para el dropdown.
 *
 * Definido aquí (no importado de providers) para mantener
 * la feature appointments autocontenida.
 */
export interface LocationOption {
  id: string
  displayName: string
}

interface UseLocationOptionsReturn {
  locations: LocationOption[]
  isLoading: boolean
}

/**
 * Hook que obtiene la lista de locations para el dropdown de filtro.
 *
 * Mismo patrón que los otros hooks de dropdown — carga una vez al montar.
 */
export function useLocationOptions(): UseLocationOptionsReturn {
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchLocations() {
      try {
        const { data } = await apiClient.get<PaginatedResponse<LocationOption>>(
          LOCATION_ENDPOINTS.LIST,
          { params: { limit: 50 } },
        )

        if (!cancelled) {
          setLocations(data.data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = isApiError(err) ? err.message : 'Failed to load locations'
          console.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchLocations()

    return () => {
      cancelled = true
    }
  }, [])

  return { locations, isLoading }
}
