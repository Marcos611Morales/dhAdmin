import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth, LoginForm } from '@/features/auth'
import type { SignInResponse } from '@/features/auth'
import { AuthLayout } from '@/layouts/AuthLayout'

/**
 * Página de login — primera vista si el admin no está autenticado.
 *
 * Si el admin ya tiene sesión activa (ej. volvió al sitio y localStorage
 * tiene datos válidos), redirige directo al dashboard sin mostrar el form.
 */
export function LoginPage() {
  const { admin, signIn } = useAuth()
  const navigate = useNavigate()

  // Si ya está autenticado, redirigir al dashboard
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  function handleLoginSuccess(response: SignInResponse) {
    signIn(response.admin, response.accessToken, response.refreshToken)
    // `replace: true` evita que el usuario pueda volver al login con el botón "Atrás"
    navigate('/admin/dashboard', { replace: true })
  }

  return (
    <AuthLayout>
      <h1 className="mb-1 text-center text-xl font-bold text-navy">
        Welcome Back
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Sign in to the admin panel
      </p>
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  )
}
