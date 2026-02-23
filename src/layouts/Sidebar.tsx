import { useState, type ComponentType } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react'
import logo from '@/assets/Logo2.png'

// ─── Tipos ─────────────────────────────────────────────────────────────

interface NavChild {
  label: string
  path: string
}

interface NavItem {
  label: string
  path: string
  icon: ComponentType<{ size?: number; className?: string }>
  children?: NavChild[]
}

// ─── Items de navegación ───────────────────────────────────────────────

/**
 * Cada item del menú de navegación.
 *
 * Los items con `children` se comportan diferente al hacer click:
 * en vez de navegar, expanden/colapsan su sub-menú. La navegación
 * ocurre a través de los children (sub-opciones).
 *
 * Los items sin `children` navegan directamente al hacer click
 * y colapsan cualquier sub-menú que esté abierto.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: IconLayoutDashboard },
  {
    label: 'Users',
    path: '/admin/users',
    icon: IconUsers,
    children: [
      { label: 'View all users', path: '/admin/users' },
      { label: 'Add new User', path: '/admin/users/new' },
    ],
  },
  {
    label: 'Providers',
    path: '/admin/providers',
    icon: IconStethoscope,
    children: [
      { label: 'View all Providers', path: '/admin/providers' },
      { label: 'Add new Provider', path: '/admin/providers/new' },
    ],
  },
  {
    label: 'Appointments',
    path: '/admin/appointments',
    icon: IconCalendar,
    children: [
      { label: 'View all Appointments', path: '/admin/appointments' },
      { label: 'Create Appointment', path: '/admin/appointments/new' },
    ],
  },
  {
    label: 'Locations',
    path: '/admin/locations',
    icon: IconMapPin,
    children: [
      { label: 'View Locations', path: '/admin/locations' },
      { label: 'Add new Location', path: '/admin/locations/new' },
    ],
  },
  { label: 'Specialties', path: '/admin/specialties', icon: IconStar },
  { label: 'FAQs', path: '/admin/faqs', icon: IconQuestionMark },
  { label: 'Contact', path: '/admin/contact-submissions', icon: IconMail },
]

// ─── Componente ────────────────────────────────────────────────────────

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
 * `expandedItem` controla qué item con sub-opciones está abierto.
 * Solo un item puede estar expandido a la vez. Se inicializa
 * automáticamente basándose en la ruta actual (ej: si el usuario
 * entra directamente a /admin/users/new, "Users" arranca expandido).
 *
 * Comportamiento de los sub-menús:
 * - Click en item con children → toggle su sub-menú
 * - Click en cualquier otro item → colapsa el sub-menú abierto
 * - Sidebar colapsado (64px) → no hay espacio para sub-items,
 *   click en el padre navega directo a su ruta principal
 */
export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Estado que guarda el `path` del item expandido (o null si ninguno).
   *
   * El lazy initializer busca si la ruta actual coincide con algún
   * parent que tenga children, para auto-expandirlo en el primer render
   * (ej: si el usuario recarga la página estando en /admin/users/new).
   */
  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    const match = NAV_ITEMS.find(
      (item) =>
        item.children &&
        (location.pathname === item.path ||
          location.pathname.startsWith(item.path + '/')),
    )
    return match?.path ?? null
  })

  function handleSignOut() {
    signOut()
    navigate('/admin/login', { replace: true })
  }

  /**
   * Click en un item que tiene sub-opciones.
   *
   * - Sidebar expandido → toggle el sub-menú (abrir/cerrar)
   * - Sidebar colapsado → no hay espacio para sub-items, navegar
   *   directamente a la ruta del padre y expandirlo (para que al
   *   volver a expandir el sidebar, el sub-menú esté abierto)
   */
  function handleParentClick(item: NavItem) {
    if (isCollapsed) {
      setExpandedItem(item.path)
      navigate(item.path)
      return
    }
    setExpandedItem((prev) => (prev === item.path ? null : item.path))
  }

  /**
   * Click en un item simple (sin children).
   * Colapsa cualquier sub-menú abierto, según el requisito de que
   * "al presionar cualquier otra opción del menú" se colapsen.
   */
  function handleSimpleItemClick() {
    setExpandedItem(null)
  }

  return (
    <aside
      className={`flex flex-col bg-navy transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-white/10 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}
      >
        <img src={logo} alt="DirectHealth" className="size-8 shrink-0" />
        {!isCollapsed && (
          <span className="text-base font-bold text-white">DirectHealth</span>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isExpanded = expandedItem === item.path

            // Para items con children, el "active" del padre se determina
            // por si la ruta actual empieza con su path (match parcial).
            // Ej: en /admin/users o /admin/users/new, "Users" se ve activo.
            const isParentActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/')

            // Check directo de item.children (no usar variable intermedia)
            // para que TypeScript pueda narrowear el tipo dentro del bloque.
            if (item.children && item.children.length > 0) {
              return (
                <li key={item.path}>
                  {/* Parent: es un <button>, no un <NavLink>, porque su
                      click expande/colapsa en vez de navegar. La navegación
                      ocurre a través de los children. */}
                  <button
                    type="button"
                    onClick={() => handleParentClick(item)}
                    title={isCollapsed ? item.label : undefined}
                    aria-expanded={!isCollapsed ? isExpanded : undefined}
                    className={`flex w-full items-center rounded-lg text-sm font-medium transition-colors ${
                      isCollapsed
                        ? 'justify-center px-2 py-2.5'
                        : 'gap-3 px-3 py-2.5'
                    } ${
                      isParentActive
                        ? 'border-l-3 border-white bg-white/15 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? (
                          <IconChevronDown size={16} className="shrink-0" />
                        ) : (
                          <IconChevronRight size={16} className="shrink-0" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Sub-items: solo se muestran cuando el parent está
                      expandido Y el sidebar no está colapsado.
                      Usan NavLink con `end` para match exacto —
                      "View all users" (/admin/users) solo se marca active
                      en esa ruta exacta, no en /admin/users/new. */}
                  {isExpanded && !isCollapsed && (
                    <ul className="mt-1 flex flex-col gap-0.5 pl-8">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            end
                            className={({ isActive }) =>
                              `flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'font-medium text-white'
                                  : 'text-white/60 hover:text-white'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            }

            // Item simple (sin children) — NavLink directo
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  onClick={handleSimpleItemClick}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg text-sm font-medium transition-colors ${
                      isCollapsed
                        ? 'justify-center px-2 py-2.5'
                        : 'gap-3 px-3 py-2.5'
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
            )
          })}
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
          {isCollapsed ? (
            <IconChevronsRight size={20} />
          ) : (
            <IconChevronsLeft size={20} />
          )}
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
