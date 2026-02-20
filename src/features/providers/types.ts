/**
 * Sub-objeto de specialty dentro de un Provider.
 * Contiene solo id y nombre — el backend hace el JOIN automáticamente.
 */
export interface ProviderSpecialty {
  id: string
  name: string
}

/**
 * Sub-objeto de location dentro de un Provider.
 * `displayName` es la concatenación de city + state (ej: "Hurley, VA").
 */
export interface ProviderLocation {
  id: string
  city: string
  state: string
  displayName: string
}

/**
 * Valores válidos de gender para un provider.
 * Mismo enum que users — se define por separado para mantener
 * cada feature autocontenida (sin importar de otra feature).
 */
export type ProviderGender = 'male' | 'female' | 'non_binary' | 'other' | 'prefer_not_to_say'

/**
 * Provider del sistema DirectHealth.
 * Corresponde a cada objeto dentro de `data[]` en GET /api/admin/providers.
 *
 * Todos los campos que la API puede devolver como null llevan `| null`.
 * `specialty` y `location` son objetos anidados (el backend hace JOINs).
 * `insurances` y `languages` son arrays de strings (solo nombres, no objetos).
 */
export interface Provider {
  id: string
  firstName: string
  lastName: string
  title: string | null
  specialty: ProviderSpecialty | null
  location: ProviderLocation | null
  profileImageUrl: string | null
  gender: ProviderGender | null
  rating: number | null
  yearsOfExperience: number | null
  bio: string | null
  appointmentPrice: number | null
  status: string | null
  nextAvailableDate: string | null
  insurances: string[]
  languages: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/**
 * Query params que acepta GET /api/admin/providers.
 *
 * `specialty` y `location` son UUIDs — se obtienen de los hooks
 * useSpecialties y useLocations que hacen fetch de las listas.
 */
export interface ProvidersQueryParams {
  page?: number
  limit?: number
  search?: string
  specialty?: string
  location?: string
  gender?: ProviderGender
  includeDeleted?: boolean
}
