import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { PROVIDER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { Provider, ProvidersQueryParams } from '@/features/providers/types'
import type { PaginatedResponse } from '@/types/api'

interface UseProvidersReturn {
  providers: Provider[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  fetchProviders: (params?: ProvidersQueryParams) => void
}

/**
 * Hook que obtiene la lista paginada de providers desde la API.
 *
 * Sigue el mismo patrón que `useUsers`:
 * - Fetch automático al montar con params por defecto
 * - Expone `fetchProviders(params)` para re-ejecutar con nuevos filtros
 * - `useCallback` mantiene la referencia estable de fetchProviders
 *
 * ```tsx
 * const { providers, total, page, totalPages, isLoading, error, fetchProviders } = useProviders()
 *
 * // Cambiar filtro
 * fetchProviders({ specialty: 'uuid-here', page: 1 })
 * ```
 */
export function useProviders(): UseProvidersReturn {
  const [providers, setProviders] = useState<Provider[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProviders = useCallback(async (params?: ProvidersQueryParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.get<PaginatedResponse<Provider>>(
        PROVIDER_ENDPOINTS.LIST,
        { params },
      )

      setProviders(data.data)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : 'Failed to load providers'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  return { providers, total, page, totalPages, isLoading, error, fetchProviders }
}
