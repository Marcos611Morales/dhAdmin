import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AdminLayout } from '@/layouts/AdminLayout'

/**
 * Guard de autenticación para rutas protegidas.
 *
 * Se usa como "layout route" en react-router-dom v7:
 * - Si el admin está autenticado, renderiza las rutas hijas con `<Outlet />`
 *   envuelto en el `AdminLayout` (sidebar + header + content area)
 * - Si no, redirige al login
 *
 * El AdminLayout envuelve el Outlet aquí porque todas las rutas protegidas
 * comparten el mismo layout (sidebar + header). Esto evita tener que
 * envolver cada página individualmente.
 */
export function ProtectedRoute() {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
