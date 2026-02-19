import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'

/**
 * Placeholder temporal para verificar que el login funciona.
 * Será reemplazado por el dashboard real.
 */
export function DashboardPlaceholder() {
  const { admin, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy">
          Welcome, {admin?.firstName}!
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Dashboard coming soon.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-6 h-10 rounded-lg border border-gray-200 bg-white px-6 text-sm font-medium text-navy transition-opacity hover:opacity-85"
        >
          Sign Out
        </button>
      </div>
    </main>
  )
}
