import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { Appointment } from '@/features/appointments/types'
import {
  buildProviderDisplayName,
  formatPrice,
  formatDate,
  formatTime,
  formatAppointmentStatus,
  getStatusBadgeClasses,
} from '@/features/appointments/utils'

interface AppointmentsTableProps {
  appointments: Appointment[]
  /** Pagina actual (1-based), para calcular el numero de fila */
  page: number
  /** Items por pagina, para calcular el offset del # */
  limit: number
  isLoading: boolean
  onEdit: (appointment: Appointment) => void
  onDelete: (appointment: Appointment) => void
}

/** Maximo de caracteres de reason antes de truncar */
const REASON_MAX_LENGTH = 60

/**
 * Trunca un texto a un maximo de caracteres, agregando "..." si se corta.
 */
function truncateReason(reason: string | null): string {
  if (!reason) return '—'
  if (reason.length <= REASON_MAX_LENGTH) return reason
  return reason.slice(0, REASON_MAX_LENGTH) + '...'
}

/**
 * Tabla de appointments con las columnas solicitadas:
 * Patient, Provider, Price, Location, Date, Time, Status, Reason, Actions
 *
 * Los botones de Edit y Delete usan `e.stopPropagation()` para evitar
 * que el click se propague a la fila (por si en el futuro se agrega
 * un click handler en la fila).
 */
export function AppointmentsTable({
  appointments,
  page,
  limit,
  isLoading,
  onEdit,
  onDelete,
}: AppointmentsTableProps) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No appointments found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-600">#</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Patient</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Provider</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Price</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Location</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Time</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Reason</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt, index) => {
            const providerName = buildProviderDisplayName(
              appt.provider.title,
              appt.provider.firstName,
              appt.provider.lastName,
            )
            const specialtyLabel = appt.provider.specialty?.name
              ? ` (${appt.provider.specialty.name})`
              : ''

            return (
              <tr
                key={appt.id}
                className="border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-500">
                  {(page - 1) * limit + index + 1}
                </td>
                <td className="px-4 py-3 font-medium text-navy">
                  {appt.user.firstName} {appt.user.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {providerName}
                  <span className="text-gray-400">{specialtyLabel}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatPrice(appt.provider.appointmentPrice)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {appt.location.displayName}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatDate(appt.appointmentDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatTime(appt.appointmentTime)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(appt.status)}`}
                  >
                    {formatAppointmentStatus(appt.status)}
                  </span>
                </td>
                <td
                  className="max-w-xs px-4 py-3 text-gray-600"
                  title={appt.reason ?? undefined}
                >
                  {truncateReason(appt.reason)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(appt)
                      }}
                      title="Edit appointment"
                      aria-label={`Edit appointment for ${appt.user.firstName} ${appt.user.lastName}`}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(appt)
                      }}
                      title="Delete appointment"
                      aria-label={`Delete appointment for ${appt.user.firstName} ${appt.user.lastName}`}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-brand-red"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
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
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
