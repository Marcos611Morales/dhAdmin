import { useState } from 'react'
import type { AdminUser } from '@/features/auth/types'
import { AuthContext } from '@/features/auth/context/auth-context'
import {
  setAccessToken,
  setRefreshToken,
  setStoredAdmin,
  getStoredAdmin,
  clearAuthStorage,
} from '@/lib/storage'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Provider que envuelve toda la app. Mantiene el estado de autenticación
 * sincronizado entre React (para re-renders) y localStorage (para persistencia).
 *
 * El lazy initializer `() => getStoredAdmin()` se ejecuta solo una vez
 * al montar el componente, no en cada render. Esto es más eficiente que
 * leer localStorage en cada ciclo de render.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => getStoredAdmin())

  function signIn(adminData: AdminUser, accessToken: string, refreshToken: string) {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setStoredAdmin(adminData)
    setAdmin(adminData)
  }

  function signOut() {
    clearAuthStorage()
    setAdmin(null)
  }

  return (
    <AuthContext value={{ admin, signIn, signOut }}>
      {children}
    </AuthContext>
  )
}
