import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import {
  IconLayoutDashboard,
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconMapPin,
  IconStar,
  IconQuestionMark,
  IconMail,
  IconChevronsLeft,
  IconChevronsRight,
  IconLogout,
} from '@tabler/icons-react'
import logo from '@/assets/Logo2.png'

/**
 * Cada item del menú de navegación.
 *
 * `path` es la ruta a la que navega el NavLink.
 * `icon` es el componente de icono de @tabler/icons-react.
 *
 * Nota: esto NO es una abstracción prematura — esta lista se usa
 * en un solo lugar (el .map de abajo) y evita repetir 8 bloques
 * de JSX casi idénticos.
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: IconLayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: IconUsers },
  { label: 'Providers', path: '/admin/providers', icon: IconStethoscope },
  { label: 'Appointments', path: '/admin/appointments', icon: IconCalendar },
  { label: 'Locations', path: '/admin/locations', icon: IconMapPin },
  { label: 'Specialties', path: '/admin/specialties', icon: IconStar },
  { label: 'FAQs', path: '/admin/faqs', icon: IconQuestionMark },
  { label: 'Contact', path: '/admin/contact-submissions', icon: IconMail },
]

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

/**
 * Sidebar de navegación principal del panel de admin.
 *
 * El estado `isCollapsed` es controlado por el componente padre
 * (AdminLayout), no por el Sidebar mismo. Esto permite que AdminLayout
 * coordine los anchos del sidebar y el área de contenido.
 *
 * Cuando está expandido (240px), muestra icono + texto de cada sección.
 * Cuando está colapsado (64px), muestra solo el icono con un `title`
 * tooltip nativo del navegador para que el usuario sepa qué sección es.
 *
 * Usa `<NavLink>` de react-router-dom en vez de `<Link>` porque NavLink
 * ofrece un callback `className={({ isActive }) => ...}` que permite
 * aplicar estilos diferentes al item que corresponde a la ruta actual.
 */
export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside
      className={`flex flex-col bg-navy transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`flex h-16 shrink-0 items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
        <img src={logo} alt="DirectHealth" className="size-8 shrink-0" />
        {!isCollapsed && (
          <span className="text-base font-bold text-white">
            DirectHealth
          </span>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-sm font-medium transition-colors ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'border-l-3 border-white bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section: collapse toggle + sign out */}
      <div className="shrink-0 border-t border-white/10 p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex w-full items-center rounded-lg py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          {isCollapsed ? <IconChevronsRight size={20} /> : <IconChevronsLeft size={20} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className={`mt-1 flex w-full items-center rounded-lg py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          }`}
        >
          <IconLogout size={20} className="shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
