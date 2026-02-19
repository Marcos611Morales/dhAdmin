import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { AuthProvider } from '@/features/auth'
import { router } from '@/routes/router'

/**
 * AuthProvider envuelve RouterProvider porque los componentes dentro
 * de las rutas (LoginPage, ProtectedRoute, etc.) necesitan acceso
 * al contexto de autenticación vía useAuth().
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
