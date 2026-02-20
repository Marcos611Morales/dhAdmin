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
