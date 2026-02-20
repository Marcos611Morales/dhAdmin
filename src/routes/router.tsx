import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { CreateUserPage } from '@/pages/CreateUserPage'

/**
 * Configuración central del router.
 *
 * `createBrowserRouter` es la API recomendada en react-router-dom v7.
 * Produce un objeto router que se pasa a `<RouterProvider>` en main.tsx.
 *
 * Estructura de rutas:
 * - /admin/login        → Página de login (pública)
 * - /admin              → Redirige a /admin/dashboard
 * - /admin/*            → Rutas protegidas (requieren auth, usan AdminLayout)
 *   - /admin/dashboard  → Dashboard con stats del sistema
 * - *                   → Cualquier otra ruta redirige a login
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
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'users/new',
        element: <CreateUserPage />,
      },
      // Futuras rutas protegidas van aquí:
      // { path: 'providers', element: <ProvidersPage /> },
      // { path: 'appointments', element: <AppointmentsPage /> },
      // { path: 'locations', element: <LocationsPage /> },
      // { path: 'specialties', element: <SpecialtiesPage /> },
      // { path: 'faqs', element: <FaqsPage /> },
      // { path: 'contact-submissions', element: <ContactSubmissionsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/admin/login" replace />,
  },
])
