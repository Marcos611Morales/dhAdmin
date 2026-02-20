/**
 * Usuario del sistema DirectHealth.
 * Corresponde a cada objeto dentro de `data[]` en GET /api/admin/users.
 */
/**
 * Valores válidos de gender que el backend puede asignar a un usuario.
 * Se extrae como type separado porque se usa tanto en `User` (con | null)
 * como en `UsersQueryParams` y filtros (sin null).
 */
export type Gender = 'male' | 'female' | 'non_binary' | 'other' | 'prefer_not_to_say'

export interface User {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  dateOfBirth: string
  gender: Gender | null
  profileImageUrl: string | null
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * Query params que acepta GET /api/admin/users.
 *
 * Todos son opcionales — si no se envían, el backend usa sus defaults
 * (page=1, limit=50, sin filtros).
 */
export interface UsersQueryParams {
  page?: number
  limit?: number
  search?: string
  gender?: Gender
  isEmailVerified?: boolean
  includeDeleted?: boolean
}
