/**
 * Respuesta paginada genérica del backend.
 *
 * Todos los endpoints de listado (users, providers, appointments, etc.)
 * devuelven este mismo formato. El genérico `T` representa el tipo de
 * cada item en el array `data`.
 *
 * Ejemplo de uso:
 * ```ts
 * const { data } = await apiClient.get<PaginatedResponse<User>>(USER_ENDPOINTS.LIST)
 * // data.data  → User[]
 * // data.total → número total de registros
 * // data.page  → página actual
 * ```
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
