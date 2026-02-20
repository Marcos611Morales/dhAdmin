import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { Provider } from '@/features/providers/types'
import { buildProviderName, formatProviderGender, formatPrice } from '@/features/providers/utils'

interface ProvidersTableProps {
  providers: Provider[]
  /** Página actual (1-based), para calcular el número de fila */
  page: number
  /** Items por página, para calcular el offset del # */
  limit: number
  isLoading: boolean
  onEdit: (provider: Provider) => void
  onDelete: (provider: Provider) => void
}

/** Máximo de caracteres de bio antes de truncar */
const BIO_MAX_LENGTH = 80

/**
 * Trunca un texto a un máximo de caracteres, agregando "..." si se corta.
 * Si el texto es null o más corto que el máximo, lo retorna tal cual.
 */
function truncateBio(bio: string | null): string {
  if (!bio) return '—'
  if (bio.length <= BIO_MAX_LENGTH) return bio
  return bio.slice(0, BIO_MAX_LENGTH) + '...'
}

/**
 * Tabla de providers con las columnas solicitadas.
 *
 * Los botones de Edit y Delete usan `e.stopPropagation()` para evitar
 * que el click se propague a la fila (por si en el futuro se agrega
 * un click handler en la fila, como en UsersTable).
 */
export function ProvidersTable({
  providers,
  page,
  limit,
  isLoading,
  onEdit,
  onDelete,
}: ProvidersTableProps) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No providers found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-600">#</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Specialty</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Location</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Gender</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Biography</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Appointment Price</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider, index) => (
            <tr
              key={provider.id}
              className="border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-gray-500">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-3 font-medium text-navy">
                {buildProviderName(provider.title, provider.firstName, provider.lastName)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {provider.specialty?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {provider.location?.displayName ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatProviderGender(provider.gender)}
              </td>
              <td className="max-w-xs px-4 py-3 text-gray-600" title={provider.bio ?? undefined}>
                {truncateBio(provider.bio)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatPrice(provider.appointmentPrice)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(provider)
                    }}
                    title="Edit provider"
                    aria-label={`Edit ${provider.firstName} ${provider.lastName}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(provider)
                    }}
                    title="Delete provider"
                    aria-label={`Delete ${provider.firstName} ${provider.lastName}`}
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
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
