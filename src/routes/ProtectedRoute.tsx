import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth'

/**
 * Guard de autenticación para rutas protegidas.
 *
 * Se usa como "layout route" en react-router-dom v7:
 * - Si el admin está autenticado, renderiza las rutas hijas con `<Outlet />`
 * - Si no, redirige al login
 *
 * En el router se configura así:
 * ```tsx
 * {
 *   path: '/admin',
 *   element: <ProtectedRoute />,
 *   children: [
 *     { path: 'dashboard', element: <DashboardPage /> },
 *   ]
 * }
 * ```
 *
 * Todas las rutas dentro de `children` quedan protegidas automáticamente
 * sin necesidad de envolver cada una individualmente.
 */
export function ProtectedRoute() {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
