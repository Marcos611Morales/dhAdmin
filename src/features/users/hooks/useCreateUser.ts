import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { USER_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError, ApiError } from '@/lib/api-error'
import type { User, CreateUserPayload } from '@/features/users/types'

interface UseCreateUserReturn {
  isLoading: boolean
  error: string | null
  fieldErrors: string[]
  createUser: (payload: CreateUserPayload) => Promise<User | null>
}

/**
 * Hook de mutación para crear un usuario vía POST /api/admin/users.
 *
 * A diferencia de `useUsers` (que hace fetch automático al montar),
 * este hook NO ejecuta nada al montarse. Solo expone una función
 * `createUser()` que el formulario llama al hacer submit.
 *
 * **Patrón "mutation hook":**
 * Los hooks de lectura (GET) normalmente usan useEffect para cargar
 * datos automáticamente. Los hooks de escritura (POST, PUT, DELETE)
 * no — solo proveen la función y el estado de la operación (loading,
 * error). La ejecución la controla el componente cuando el usuario
 * interactúa (click en Submit, por ejemplo).
 *
 * **Retorno de la función:**
 * `createUser()` retorna una `Promise<User | null>`:
 * - `User` si la creación fue exitosa (el backend devuelve el usuario creado)
 * - `null` si falló (el error ya se guardó en el state)
 *
 * Esto permite que el componente que llama haga:
 * ```tsx
 * const user = await createUser(payload)
 * if (user) {
 *   // Mostrar modal de éxito, limpiar form, etc.
 * }
 * ```
 *
 * **Manejo de errores:**
 * - `error`: mensaje principal del error (para mostrar un banner)
 * - `fieldErrors`: array de errores de validación (cuando el backend
 *   devuelve 400 con `message: ["email must be valid", "..."]`)
 *
 * Diferencia entre error y fieldErrors:
 * - 409 Conflict (email duplicado) → error = "Email already exists", fieldErrors = []
 * - 400 Bad Request (validación) → error = primer mensaje, fieldErrors = todos los mensajes
 * - Error de red → error = "Failed to create user", fieldErrors = []
 */
export function useCreateUser(): UseCreateUserReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const createUser = useCallback(async (payload: CreateUserPayload): Promise<User | null> => {
    setIsLoading(true)
    setError(null)
    setFieldErrors([])

    try {
      const { data } = await apiClient.post<User>(
        USER_ENDPOINTS.CREATE,
        payload,
      )

      return data
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message)

        // Si el backend envió múltiples errores de validación,
        // guardarlos en fieldErrors para que el form pueda mostrarlos
        if (err instanceof ApiError && err.errors.length > 1) {
          setFieldErrors(err.errors)
        }
      } else {
        setError('Failed to create user')
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, fieldErrors, createUser }
}
