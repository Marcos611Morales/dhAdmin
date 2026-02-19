import { createContext } from 'react'
import type { AuthContextValue } from '@/features/auth/types'

/**
 * Context de autenticación.
 *
 * Vive en su propio archivo (separado del Provider) porque el plugin
 * react-refresh de ESLint requiere que los archivos .tsx solo exporten
 * componentes React, no objetos de Context.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
