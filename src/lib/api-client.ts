import axios from 'axios'
import { API_BASE_URL } from '@/lib/config'
import { ApiError } from '@/lib/api-error'
import { getAccessToken } from '@/lib/storage'

/**
 * Instancia de axios preconfigurada para el backend de DirectHealth.
 *
 * - baseURL apunta a /api (todos los endpoints del backend viven ahí)
 * - Content-Type JSON por defecto
 * - El interceptor de respuesta transforma errores HTTP en ApiError tipados
 *
 * Uso:
 * ```ts
 * import { apiClient } from '@/lib/api-client'
 *
 * const { data } = await apiClient.get<User[]>('/admin/users')
 * const { data } = await apiClient.post<AuthResponse>('/admin/auth/sign-in', body)
 * ```
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Interceptor de request — adjunta el JWT token a cada petición.
 *
 * Lee el token de localStorage (no del React Context) porque este código
 * es plain TypeScript fuera del árbol de React. El AuthContext y este
 * interceptor comparten la misma fuente de verdad (localStorage) a través
 * de las funciones en storage.ts.
 */
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Interceptor de respuesta — manejo centralizado de errores.
 *
 * Cuando el backend responde con un código no-2xx, axios lo trata como error.
 * Este interceptor captura ese error y lo transforma en un ApiError tipado
 * para que toda la app maneje errores de forma consistente.
 *
 * Si la petición falla por red (sin respuesta del servidor), lanza un
 * ApiError genérico con statusCode 0.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const { statusCode, message, error: errorType } = error.response.data
      throw new ApiError({ statusCode, message, error: errorType })
    }

    throw new ApiError({
      statusCode: 0,
      message: 'Error de conexión. Verifica tu red.',
      error: 'NetworkError',
    })
  },
)
