import { Link } from 'react-router-dom'
import type { ComponentType } from 'react'

interface QuickAccessCardProps {
  /** Componente de icono de @tabler/icons-react */
  icon: ComponentType<{ size?: number; className?: string }>
  /** Nombre de la sección (ej: "Users") */
  title: string
  /** Breve descripción de la sección */
  description: string
  /** Ruta a la que navega (ej: "/admin/users") */
  to: string
}

/**
 * Tarjeta de acceso rápido que enlaza a una sección del admin.
 *
 * Usa `<Link>` de react-router-dom en lugar de `<a>` para hacer
 * navegación client-side (sin recargar la página completa).
 *
 * La clase `group` de Tailwind permite que los elementos hijos
 * reaccionen al hover del padre. Cuando el usuario pasa el mouse
 * sobre la tarjeta, el icono cambia de color gracias a `group-hover:`.
 */
export function QuickAccessCard({ icon: Icon, title, description, to }: QuickAccessCardProps) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-gray-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-navy group-hover:text-white">
        <Icon size={18} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-navy">
        {title}
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>
    </Link>
  )
}
