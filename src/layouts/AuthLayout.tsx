import logo from '@/assets/Logo1.png'

interface AuthLayoutProps {
  children: React.ReactNode
}

/**
 * Layout centrado para páginas de autenticación (login).
 *
 * Muestra una card blanca centrada en pantalla con el logo de DirectHealth
 * arriba del contenido. Se reutilizará si en el futuro hay más páginas
 * de auth (ej. forgot password).
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-8 flex justify-center">
          <img
            src={logo}
            alt="DirectHealth"
            className="h-12"
          />
        </div>
        {children}
      </div>
    </main>
  )
}
