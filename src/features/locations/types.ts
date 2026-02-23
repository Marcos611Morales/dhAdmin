/**
 * Location del sistema DirectHealth.
 * Corresponde a cada objeto dentro de `data[]` en GET /api/admin/locations.
 *
 * `displayName` es la concatenación de city + state generada por el backend
 * (ej: "Hurley, VA").
 */
export interface Location {
  id: string
  city: string
  state: string
  displayName: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * Query params que acepta GET /api/admin/locations.
 *
 * Sigue el patrón estándar de paginación del backend:
 * `page`, `limit`, `search`.
 */
export interface LocationsQueryParams {
  page?: number
  limit?: number
  search?: string
  includeDeleted?: boolean
}
