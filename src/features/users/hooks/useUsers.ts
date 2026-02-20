import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { USER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { User, UsersQueryParams } from '@/features/users/types'
import type { PaginatedResponse } from '@/types/api'

interface UseUsersReturn {
  users: User[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  fetchUsers: (params?: UsersQueryParams) => void
}

/**
 * Hook que obtiene la lista paginada de usuarios desde la API.
 *
 * A diferencia de `useDashboardStats` (que hace un solo fetch al montar),
 * este hook necesita poder re-ejecutar el fetch cuando cambian los filtros,
 * la búsqueda o la página. Por eso expone `fetchUsers()` como función pública.
 *
 * Flujo:
 * 1. Al montar el componente, hace fetch automático con los params por defecto
 * 2. Cuando el usuario cambia página, busca, o filtra, el componente llama
 *    `fetchUsers({ page: 2, search: 'john', ... })` y el hook re-ejecuta el fetch
 *
 * `fetchUsers` está envuelto en `useCallback` para que su referencia sea estable.
 * Esto es importante porque si un componente pasa `fetchUsers` como dependencia
 * de un `useEffect`, no se dispararía un loop infinito de re-renders.
 *
 * El `useEffect` inicial llama a `fetchUsers()` sin argumentos para cargar
 * la primera página. Cuando el componente necesita datos diferentes (nueva
 * página, búsqueda, filtro), llama `fetchUsers(newParams)` directamente.
 *
 * ```tsx
 * function UsersPage() {
 *   const { users, total, page, totalPages, isLoading, error, fetchUsers } = useUsers()
 *
 *   // Cambiar de página
 *   function handlePageChange(newPage: number) {
 *     fetchUsers({ page: newPage })
 *   }
 *
 *   // Buscar
 *   function handleSearch(term: string) {
 *     fetchUsers({ search: term, page: 1 })
 *   }
 * }
 * ```
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Ejecuta el fetch de usuarios con los params indicados.
   *
   * Los query params se pasan a axios como `params`, que los serializa
   * automáticamente en la URL: `/admin/users?page=1&limit=50&search=john`.
   * axios omite automáticamente los params con valor `undefined`, así que
   * solo se envían los que tienen valor.
   */
  const fetchUsers = useCallback(async (params?: UsersQueryParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.get<PaginatedResponse<User>>(
        USER_ENDPOINTS.LIST,
        { params },
      )

      setUsers(data.data)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : 'Failed to load users'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, total, page, totalPages, isLoading, error, fetchUsers }
}
