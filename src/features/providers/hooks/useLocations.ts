import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { LOCATION_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { PaginatedResponse } from '@/types/api'

/**
 * Tipo mínimo de una location — solo lo necesario para el dropdown.
 */
export interface Location {
  id: string
  displayName: string
}

interface UseLocationsReturn {
  locations: Location[]
  isLoading: boolean
}

/**
 * Hook que obtiene la lista de locations para los dropdowns de filtros.
 *
 * Mismo patrón que `useSpecialties` — carga una vez al montar.
 * Usa el flag `cancelled` para prevenir updates en componentes desmontados.
 */
export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchLocations() {
      try {
        const { data } = await apiClient.get<PaginatedResponse<Location>>(
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
