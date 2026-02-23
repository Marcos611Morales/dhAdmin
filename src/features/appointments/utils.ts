import type { AppointmentStatus } from '@/features/appointments/types'

/**
 * Labels legibles para cada status de appointment.
 */
const STATUS_LABELS: Record<AppointmentStatus, string> = {
  upcoming: 'Upcoming',
  past: 'Past',
  cancelled: 'Cancelled',
}

/**
 * Formatea el status de un appointment a texto legible.
 */
export function formatAppointmentStatus(status: AppointmentStatus): string {
  return STATUS_LABELS[status] ?? status
}

/**
 * Clases CSS de Tailwind para el badge de cada status.
 *
 * Los colores vienen del design system definido en index.css:
 * - upcoming: azul (badge-upcoming-bg / badge-upcoming-text)
 * - past: gris (gray-100 / gray-500)
 * - cancelled: rojo (badge-cancelled-bg / brand-red)
 */
const STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  upcoming: 'bg-badge-upcoming-bg text-badge-upcoming-text',
  past: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-badge-cancelled-bg text-brand-red',
}

/**
 * Retorna las clases CSS para el badge de un status de appointment.
 */
export function getStatusBadgeClasses(status: AppointmentStatus): string {
  return STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-500'
}

/**
 * Formatea un precio numérico a formato moneda USD.
 * Maneja el caso donde la API puede retornar el precio como string
 * (PostgreSQL DECIMAL).
 *
 * `150` → `$150.00`, `null` → `'—'`
 */
export function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return '—'
  const numeric = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numeric)) return '—'
  return `$${numeric.toFixed(2)}`
}

/**
 * Construye el nombre completo de un provider para la tabla.
 * Concatena title (si existe) + firstName + lastName.
 *
 * "Dr." + "Sam" + "Peterson" → "Dr. Sam Peterson"
 */
export function buildProviderDisplayName(
  title: string | null,
  firstName: string,
  lastName: string,
): string {
  const parts: string[] = []
  if (title) parts.push(title)
  parts.push(firstName)
  parts.push(lastName)
  return parts.join(' ')
}

/**
 * Formatea la fecha de un appointment para mostrar en la tabla.
 * La API devuelve formato 'YYYY-MM-DD'. Lo convertimos a un formato
 * más legible: 'MM/DD/YYYY'.
 *
 * Se usa split/join en vez de `new Date()` para evitar problemas
 * de timezone — `new Date('2025-10-15')` se interpreta como UTC
 * y puede mostrar el día anterior en timezones negativos.
 */
export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  if (!year || !month || !day) return dateString
  return `${month}/${day}/${year}`
}

/**
 * Formatea la hora de un appointment para mostrar en la tabla.
 * La API devuelve formato 'HH:MM' (24h). Lo convertimos a 12h con AM/PM.
 *
 * '14:00' → '2:00 PM'
 * '09:30' → '9:30 AM'
 */
export function formatTime(timeString: string): string {
  const [hoursStr, minutes] = timeString.split(':')
  if (!hoursStr || !minutes) return timeString
  const hours = parseInt(hoursStr, 10)
  if (isNaN(hours)) return timeString

  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  return `${displayHours}:${minutes} ${period}`
}
