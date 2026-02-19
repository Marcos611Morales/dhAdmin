import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPlaceholder } from '@/pages/DashboardPlaceholder'

/**
 * Configuración central del router.
 *
 * `createBrowserRouter` es la API recomendada en react-router-dom v7.
 * Produce un objeto router que se pasa a `<RouterProvider>` en main.tsx.
 *
 * Estructura de rutas:
 * - /admin/login      → Página de login (pública)
 * - /admin/*          → Rutas protegidas (requieren auth)
 *   - /admin/dashboard  → Dashboard (placeholder por ahora)
 * - *                 → Cualquier otra ruta redirige a login
 */
export const router = createBrowserRouter([
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPlaceholder />,
      },
      // Futuras rutas protegidas van aquí:
      // { path: 'users', element: <UsersPage /> },
      // { path: 'providers', element: <ProvidersPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin/login" replace />,
  },
])
