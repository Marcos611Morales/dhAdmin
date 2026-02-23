/**
 * Sub-objeto de user dentro de un Appointment.
 * El backend hace JOIN con la tabla users y devuelve estos campos.
 */
export interface AppointmentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Sub-objeto de specialty dentro del provider de un Appointment.
 */
export interface AppointmentProviderSpecialty {
  id: string
  name: string
}

/**
 * Sub-objeto de provider dentro de un Appointment.
 * Incluye la specialty anidada porque el backend hace JOIN cascada.
 */
export interface AppointmentProvider {
  id: string
  firstName: string
  lastName: string
  title: string | null
  specialty: AppointmentProviderSpecialty | null
  profileImageUrl: string | null
  appointmentPrice: number | null
}

/**
 * Sub-objeto de location dentro de un Appointment.
 */
export interface AppointmentLocation {
  id: string
  displayName: string
}

/**
 * Valores válidos de status para un appointment.
 * El backend usa el enum `appointment_status_type` en PostgreSQL.
 */
export type AppointmentStatus = 'upcoming' | 'past' | 'cancelled'

/**
 * Tipo del filtro de status en la UI.
 * Extiende AppointmentStatus con '' (string vacío) que representa "All" —
 * cuando el usuario selecciona "All", no se envía ningún valor de status
 * en la query al backend.
 */
export type StatusFilter = AppointmentStatus | ''

/**
 * Appointment del sistema DirectHealth.
 * Corresponde a cada objeto dentro de `data[]` en GET /api/admin/appointments.
 *
 * El backend devuelve los objetos anidados (user, provider, location)
 * ya resueltos con JOINs — no son solo IDs.
 */
export interface Appointment {
  id: string
  user: AppointmentUser
  provider: AppointmentProvider
  location: AppointmentLocation
  appointmentDate: string
  appointmentTime: string
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  isFavorite: boolean
  createdAt: string
  deletedAt?: string | null
}

/**
 * Query params que acepta GET /api/admin/appointments.
 *
 * `status` default es 'upcoming' en el backend — si no se envía,
 * solo retorna citas upcoming. Pero nosotros lo enviamos siempre
 * para que sea explícito.
 *
 * `userId`, `providerId` y `locationId` son UUIDs que se obtienen
 * de los dropdowns (hooks de opciones).
 *
 * `dateFrom` y `dateTo` usan formato 'YYYY-MM-DD'.
 */
export interface AppointmentsQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: AppointmentStatus
  userId?: string
  providerId?: string
  locationId?: string
  dateFrom?: string
  dateTo?: string
  includeDeleted?: boolean
}
