import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { Location } from '@/features/locations/types'

interface LocationsTableProps {
  locations: Location[]
  page: number
  limit: number
  isLoading: boolean
  onEdit: (location: Location) => void
  onDelete: (location: Location) => void
}

/**
 * Tabla de locations con columnas: #, City, State, Actions.
 *
 * Sigue el mismo patrón visual que UsersTable y ProvidersTable.
 * La columna "#" muestra un número correlativo basado en la página actual.
 */
export function LocationsTable({
  locations,
  page,
  limit,
  isLoading,
  onEdit,
  onDelete,
}: LocationsTableProps) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (locations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No locations found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-600">#</th>
            <th className="px-4 py-3 font-semibold text-gray-600">City</th>
            <th className="px-4 py-3 font-semibold text-gray-600">State</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location, index) => (
            <tr
              key={location.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-gray-500">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-3 font-medium text-navy">{location.city}</td>
              <td className="px-4 py-3 text-gray-600">{location.state}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(location)}
                    title="Edit location"
                    aria-label={`Edit ${location.city}, ${location.state}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(location)}
                    title="Delete location"
                    aria-label={`Delete ${location.city}, ${location.state}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-brand-red"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Skeleton loader ─────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="animate-pulse divide-y divide-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5">
            <div className="h-4 w-8 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
