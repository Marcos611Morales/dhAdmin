import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { PROVIDER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError, ApiError } from '@/lib/api-error'
import type { Provider, CreateProviderPayload } from '@/features/providers/types'

interface UseCreateProviderReturn {
  isLoading: boolean
  error: string | null
  fieldErrors: string[]
  createProvider: (payload: CreateProviderPayload) => Promise<Provider | null>
}

/**
 * Hook de mutación para crear un provider vía POST /api/admin/providers.
 *
 * Mismo patrón que `useCreateUser`:
 * - No ejecuta nada al montarse (no useEffect)
 * - Expone `createProvider()` que se llama desde el form submit
 * - Retorna Provider si éxito, null si falla
 * - Guarda error y fieldErrors en el estado para mostrar en la UI
 */
export function useCreateProvider(): UseCreateProviderReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const createProvider = useCallback(async (payload: CreateProviderPayload): Promise<Provider | null> => {
    setIsLoading(true)
    setError(null)
    setFieldErrors([])

    try {
      const { data } = await apiClient.post<Provider>(
        PROVIDER_ENDPOINTS.CREATE,
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
        setError('Failed to create provider')
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, fieldErrors, createProvider }
}
