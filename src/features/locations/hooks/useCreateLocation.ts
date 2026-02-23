import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { LOCATION_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError, ApiError } from '@/lib/api-error'
import type { Location, CreateLocationPayload } from '@/features/locations/types'

interface UseCreateLocationReturn {
  isLoading: boolean
  error: string | null
  fieldErrors: string[]
  createLocation: (payload: CreateLocationPayload) => Promise<Location | null>
}

/**
 * Hook de mutación para crear una location vía POST /api/admin/locations.
 *
 * Mismo patrón que `useCreateAppointment`:
 * - No ejecuta nada al montarse (no useEffect)
 * - Expone `createLocation()` que se llama desde el form submit
 * - Retorna Location si éxito, null si falla
 * - Guarda error y fieldErrors en el estado para mostrar en la UI
 */
export function useCreateLocation(): UseCreateLocationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const createLocation = useCallback(async (payload: CreateLocationPayload): Promise<Location | null> => {
    setIsLoading(true)
    setError(null)
    setFieldErrors([])

    try {
      const { data } = await apiClient.post<Location>(
        LOCATION_ENDPOINTS.CREATE,
        payload,
      )

      return data
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message)

        if (err instanceof ApiError && err.errors.length > 1) {
          setFieldErrors(err.errors)
        }
      } else {
        setError('Failed to create location')
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, fieldErrors, createLocation }
}
