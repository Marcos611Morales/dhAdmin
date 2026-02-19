import { useContext } from 'react'
import { AuthContext } from '@/features/auth/context/auth-context'
import type { AuthContextValue } from '@/features/auth/types'

/**
 * Hook para acceder al contexto de autenticación.
 *
 * Debe usarse dentro de un `<AuthProvider>`. Si se usa fuera,
 * lanza un error claro para facilitar debugging.
 *
 * ```tsx
 * function MyComponent() {
 *   const { admin, signOut } = useAuth()
 *   // admin es null si no hay sesión
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
