/**
 * Datos del admin autenticado.
 * Corresponde al objeto `admin` que devuelve POST /api/admin/auth/sign-in.
 */
export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

/**
 * Body del request POST /api/admin/auth/sign-in.
 */
export interface SignInRequest {
  email: string
  password: string
}

/**
 * Respuesta exitosa de POST /api/admin/auth/sign-in y POST /api/admin/auth/refresh.
 */
export interface SignInResponse {
  accessToken: string
  refreshToken: string
  admin: AdminUser
}

/**
 * Valor que expone el AuthContext a los componentes.
 *
 * - `admin` es null cuando no hay sesión activa.
 * - Para verificar si está autenticado: `admin !== null`
 */
export interface AuthContextValue {
  admin: AdminUser | null
  signIn: (admin: AdminUser, accessToken: string, refreshToken: string) => void
  signOut: () => void
}
