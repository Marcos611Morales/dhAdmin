import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { AUTH_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { SignInRequest, SignInResponse } from '@/features/auth/types'

/**
 * Valor de retorno del hook useSignIn.
 */
interface UseSignInReturn {
  signIn: (credentials: SignInRequest) => Promise<SignInResponse>
  isLoading: boolean
  error: string | null
}

/**
 * Hook que encapsula la llamada a POST /api/admin/auth/sign-in.
 *
 * Separa la lógica de la API del componente (buena práctica en React).
 * El componente solo necesita llamar `signIn()` y reaccionar al resultado.
 *
 * - `isLoading` — true mientras la petición está en curso
 * - `error` — mensaje de error del backend (ej. "Invalid email or password"), null si no hay error
 * - `signIn()` — ejecuta la petición. Retorna la respuesta si es exitosa, lanza error si falla
 *
 * ```tsx
 * const { signIn, isLoading, error } = useSignIn()
 *
 * async function handleSubmit() {
 *   try {
 *     const response = await signIn({ email, password })
 *     // Login exitoso, response tiene accessToken, refreshToken y admin
 *   } catch {
 *     // Error ya está en `error`, se muestra en la UI automáticamente
 *   }
 * }
 * ```
 */
export function useSignIn(): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(credentials: SignInRequest): Promise<SignInResponse> {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.post<SignInResponse>(
        AUTH_ENDPOINTS.SIGN_IN,
        credentials,
      )
      return data
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : 'An unexpected error occurred'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { signIn, isLoading, error }
}
