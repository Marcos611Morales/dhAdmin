import type { ComponentType } from 'react'

interface StatCardProps {
  /** Componente de icono de @tabler/icons-react */
  icon: ComponentType<{ size?: number; className?: string }>
  /** Texto descriptivo debajo del número (ej: "Total Users") */
  label: string
  /** Valor numérico de la estadística */
  value: number
  /** Clase CSS para el fondo del círculo del icono (ej: "bg-blue-100 text-blue-600") */
  iconClassName?: string
  /** Cuando es true, muestra un skeleton animado en lugar del contenido */
  isLoading?: boolean
}

/**
 * Tarjeta individual de estadística para el Dashboard.
 *
 * Muestra un icono dentro de un círculo coloreado, el valor numérico
 * formateado con separadores de miles, y un label descriptivo.
 *
 * Cuando `isLoading` es true, muestra bloques con `animate-pulse`
 * (el efecto de "parpadeo" gris que indica que los datos están cargando).
 * Este patrón se llama "skeleton loader" y es mejor que un spinner
 * porque le da al usuario una idea de la forma del contenido que va a aparecer.
 */
export function StatCard({ icon: Icon, label, value, iconClassName, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
        <div className="animate-pulse">
          <div className="size-10 rounded-full bg-gray-200" />
          <div className="mt-4 h-7 w-20 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
        </div>
      </article>
    )
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <div className={`flex size-10 items-center justify-center rounded-full ${iconClassName ?? 'bg-gray-100 text-gray-600'}`}>
        <Icon size={20} />
      </div>
      <p className="mt-4 text-2xl font-bold text-navy">
        {value.toLocaleString('en-US')}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {label}
      </p>
    </article>
  )
}
