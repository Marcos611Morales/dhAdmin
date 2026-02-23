import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { LOCATION_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { Location, LocationsQueryParams } from '@/features/locations/types'
import type { PaginatedResponse } from '@/types/api'

interface UseLocationsReturn {
  locations: Location[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  fetchLocations: (params?: LocationsQueryParams) => void
}

/**
 * Hook que obtiene la lista paginada de locations desde la API.
 *
 * Mismo patrón que `useUsers`:
 * - Fetch automático al montar (primera página)
 * - Expone `fetchLocations()` para re-ejecutar con nuevos params
 *   (búsqueda, paginación, filtros)
 * - Maneja estados de loading y error
 */
export function useLocations(): UseLocationsReturn {
  const [locations, setLocations] = useState<Location[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = useCallback(async (params?: LocationsQueryParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.get<PaginatedResponse<Location>>(
        LOCATION_ENDPOINTS.LIST,
        { params },
      )

      setLocations(data.data)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : 'Failed to load locations'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return { locations, total, page, totalPages, isLoading, error, fetchLocations }
}
