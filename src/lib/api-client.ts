import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/lib/config'
import { ApiError } from '@/lib/api-error'
import { AUTH_ENDPOINTS } from '@/lib/api-endpoints'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  setStoredAdmin,
  clearAuthStorage,
} from '@/lib/storage'

/**
 * Respuesta del endpoint POST /admin/auth/refresh.
 *
 * Definida localmente (no importada de features/auth) para que api-client.ts
 * no dependa de ninguna feature. Los mismos campos que SignInResponse.
 */
interface RefreshResponse {
  accessToken: string
  refreshToken: string
  admin: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

/**
 * Config de axios extendido con flag `_retry` para evitar
 * reintentos infinitos del refresh token.
 */
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/**
 * Item en la cola de peticiones que fallaron con 401 mientras
 * un refresh ya estaba en progreso.
 */
interface QueueItem {
  config: RetryableRequestConfig
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}

/**
 * Instancia de axios preconfigurada para el backend de DirectHealth.
 *
 * - baseURL apunta a /api (todos los endpoints del backend viven ahí)
 * - Content-Type JSON por defecto
 * - Request interceptor: adjunta JWT access token a cada petición
 * - Response interceptor: refresca el token automáticamente si recibe 401
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

// ─── Refresh Token Logic ───────────────────────────────────────────────

/**
 * `isRefreshing` evita que múltiples 401 simultáneos disparen
 * múltiples llamadas al endpoint de refresh. Solo la primera
 * petición que recibe 401 hace el refresh; las demás se encolan
 * en `failedQueue` y se reintentan cuando el refresh termina.
 */
let isRefreshing = false
let failedQueue: QueueItem[] = []

/**
 * Procesa la cola de peticiones pendientes después de que el refresh
 * termina (exitoso o fallido).
 *
 * - Si `newToken` no es null → el refresh fue exitoso. Reintenta cada
 *   petición con el nuevo token.
 * - Si `newToken` es null → el refresh falló. Rechaza cada petición
 *   con el error original.
 */
function processQueue(error: unknown, newToken: string | null) {
  failedQueue.forEach(({ config, resolve, reject }) => {
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`
      resolve(apiClient(config))
    } else {
      reject(error)
    }
  })
  failedQueue = []
}

/**
 * Interceptor de respuesta — refresh automático + manejo de errores.
 *
 * Flujo cuando una petición recibe 401 (Unauthorized):
 *
 * 1. Si la petición es a un endpoint de auth (/admin/auth/*), NO intenta
 *    refrescar (evita loops infinitos). Transforma el error a ApiError.
 *
 * 2. Si ya hay un refresh en progreso (`isRefreshing === true`), encola
 *    la petición en `failedQueue`. Cuando el refresh termine, la cola
 *    se procesa automáticamente.
 *
 * 3. Si no hay refresh en progreso, inicia uno:
 *    a. Llama a POST /admin/auth/refresh con el refresh token almacenado
 *       (usa `axios.post` directo, no `apiClient`, para evitar que el
 *       interceptor de request/response interfiera con la llamada de refresh)
 *    b. Si el refresh es exitoso: guarda nuevos tokens, procesa la cola,
 *       y reintenta la petición original con el nuevo access token
 *    c. Si el refresh falla: procesa la cola con error, limpia localStorage,
 *       y redirige a login (full page reload para resetear React state)
 *
 * Para errores no-401, transforma el error en un ApiError tipado
 * para que toda la app maneje errores de forma consistente.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    // Errores no-axios (red caída, timeout, etc.)
    if (!axios.isAxiosError(error) || !error.config) {
      throw new ApiError({
        statusCode: 0,
        message: 'Error de conexión. Verifica tu red.',
        error: 'NetworkError',
      })
    }

    const originalRequest = error.config as RetryableRequestConfig

    // Solo intentar refresh si:
    // 1. Es un 401 (token expirado)
    // 2. NO es un endpoint de auth (evita loops: si el login o refresh fallan con 401, no refrescar)
    // 3. NO es un reintento (el flag _retry previene loops infinitos)
    const isAuthEndpoint = originalRequest.url?.includes('/admin/auth/')

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      // Si ya hay un refresh en progreso, encolar esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ config: originalRequest, resolve, reject })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const storedRefreshToken = getRefreshToken()

      // Sin refresh token → no se puede refrescar, forzar logout
      if (!storedRefreshToken) {
        isRefreshing = false
        processQueue(error, null)
        clearAuthStorage()
        window.location.href = '/admin/login'
        return Promise.reject(error)
      }

      try {
        // Usar axios directamente (no apiClient) para evitar que los
        // interceptors interfieran con la llamada de refresh
        const { data } = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/api${AUTH_ENDPOINTS.REFRESH}`,
          { refreshToken: storedRefreshToken },
        )

        // Guardar nuevos tokens y datos del admin en localStorage
        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        setStoredAdmin(data.admin)

        // Desbloquear peticiones encoladas con el nuevo token
        processQueue(null, data.accessToken)

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh falló (refresh token expirado o inválido)
        // → limpiar sesión completa y redirigir a login
        processQueue(refreshError, null)
        clearAuthStorage()
        window.location.href = '/admin/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Todos los demás errores → transformar a ApiError tipado
    if (error.response?.data) {
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
