import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { PROVIDER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { PaginatedResponse } from '@/types/api'

/**
 * Tipo mínimo de un provider — solo lo necesario para el dropdown de filtro.
 *
 * Incluye `title` para mostrar "Dr. Sam Peterson" en el dropdown,
 * siguiendo lo que el usuario pidió.
 */
export interface ProviderOption {
  id: string
  firstName: string
  lastName: string
  title: string | null
}

interface UseProviderOptionsReturn {
  providers: ProviderOption[]
  isLoading: boolean
}

/**
 * Hook que obtiene la lista de providers para el dropdown de filtro.
 *
 * Mismo patrón que `useUserOptions` — carga una vez al montar.
 * Se pide con `limit: 500` para obtener suficientes providers.
 */
export function useProviderOptions(): UseProviderOptionsReturn {
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchProviders() {
      try {
        const { data } = await apiClient.get<PaginatedResponse<ProviderOption>>(
          PROVIDER_ENDPOINTS.LIST,
          { params: { limit: 50 } },//Cambio a 50 porque el back no devuelme mas que eso 
        )

        if (!cancelled) {
          setProviders(data.data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = isApiError(err) ? err.message : 'Failed to load providers'
          console.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchProviders()

    return () => {
      cancelled = true
    }
  }, [])

  return { providers, isLoading }
}
