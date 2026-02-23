import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { USER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { PaginatedResponse } from '@/types/api'

/**
 * Tipo mínimo de un usuario — solo lo necesario para el dropdown de filtro.
 *
 * No importamos el tipo `User` de la feature users para mantener
 * appointments autocontenido (regla de features sin cross-imports).
 */
export interface UserOption {
  id: string
  firstName: string
  lastName: string
}

interface UseUserOptionsReturn {
  users: UserOption[]
  isLoading: boolean
}

/**
 * Hook que obtiene la lista de usuarios para el dropdown de filtro.
 *
 * Mismo patrón que `useSpecialties` / `useLocations` — carga una vez al montar.
 * Se pide con `limit: 500` para obtener suficientes usuarios para el dropdown.
 * El backend retorna objetos completos de User, pero solo usamos id/firstName/lastName.
 */
export function useUserOptions(): UseUserOptionsReturn {
  const [users, setUsers] = useState<UserOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      try {
        const { data } = await apiClient.get<PaginatedResponse<UserOption>>(
          USER_ENDPOINTS.LIST,
          { params: { limit: 50 } },
        )

        if (!cancelled) {
          setUsers(data.data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = isApiError(err) ? err.message : 'Failed to load users'
          console.error(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      cancelled = true
    }
  }, [])

  return { users, isLoading }
}
