/**
 * Rutas de los endpoints del backend.
 *
 * Todas las rutas son relativas a la baseURL del apiClient (`${API_BASE_URL}/api`),
 * por lo que NO incluyen el prefijo `/api`.
 *
 * Uso:
 * ```ts
 * import { apiClient } from '@/lib/api-client'
 * import { AUTH_ENDPOINTS } from '@/lib/api-endpoints'
 *
 * await apiClient.post(AUTH_ENDPOINTS.SIGN_IN, { email, password })
 * ```
 */

export const AUTH_ENDPOINTS = {
  SIGN_IN: '/admin/auth/sign-in',
  SIGN_OUT: '/admin/auth/sign-out',
  REFRESH: '/admin/auth/refresh',
} as const

export const DASHBOARD_ENDPOINTS = {
  STATS: '/admin/dashboard/stats',
} as const

export const USER_ENDPOINTS = {
  LIST: '/admin/users',
  CREATE: '/admin/users',
} as const

export const PROVIDER_ENDPOINTS = {
  LIST: '/admin/providers',
  CREATE: '/admin/providers',
} as const

export const SPECIALTY_ENDPOINTS = {
  LIST: '/admin/specialties',
} as const

export const LOCATION_ENDPOINTS = {
  LIST: '/admin/locations',
} as const

export const APPOINTMENT_ENDPOINTS = {
  LIST: '/admin/appointments',
  CREATE: '/admin/appointments',
} as const

/**
 * Endpoint para time slots de un provider.
 * Recibe el providerId como parámetro porque la ruta es dinámica.
 */
export function providerTimeSlotsUrl(providerId: string): string {
  return `/admin/providers/${providerId}/time-slots`
}
