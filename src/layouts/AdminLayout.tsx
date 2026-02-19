import { useState } from 'react'
import { IconUserCircle } from '@tabler/icons-react'
import { useAuth } from '@/features/auth'
import { Sidebar } from '@/layouts/Sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Layout principal del panel de administración.
 *
 * Estructura:
 * ┌──────────┬──────────────────────────┐
 * │          │  Header (nombre + avatar) │
 * │ Sidebar  ├──────────────────────────┤
 * │          │                          │
 * │          │   Content (children)     │
 * │          │                          │
 * └──────────┴──────────────────────────┘
 *
 * El estado `isCollapsed` vive aquí porque el Sidebar y el área de
 * contenido necesitan coordinarse: cuando el sidebar se colapsa,
 * el contenido se expande automáticamente gracias a `flex-1`.
 *
 * `h-screen` + `overflow-hidden` en el contenedor raíz evita que
 * la página entera haga scroll. En su lugar, solo el `<main>`
 * (área de contenido) tiene `overflow-y-auto` para scroll interno.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-navy">
              {admin?.firstName} {admin?.lastName}
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-gray-100">
              <IconUserCircle size={24} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
