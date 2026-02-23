import { useState, useEffect, useRef } from 'react'
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { useUserOptions } from '@/features/appointments/hooks/useUserOptions'
import { useProviderOptions } from '@/features/appointments/hooks/useProviderOptions'
import { useLocationOptions } from '@/features/appointments/hooks/useLocationOptions'
import type { Appointment, StatusFilter, AppointmentsQueryParams } from '@/features/appointments/types'
import { AppointmentsFilters } from '@/features/appointments/components/AppointmentsFilters'
import { AppointmentsTable } from '@/features/appointments/components/AppointmentsTable'
import { AppointmentsPagination } from '@/features/appointments/components/AppointmentsPagination'

/** Items por pagina — coincide con el default del backend */
const PAGE_LIMIT = 50

/** Milisegundos de espera antes de ejecutar la busqueda (debounce) */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Formatea un Date a string 'YYYY-MM-DD' para enviar al backend.
 *
 * Se usa `getFullYear`, `getMonth`, `getDate` (metodos locales, no UTC)
 * porque el DatePicker devuelve un Date basado en el timezone local.
 * Si usaramos `toISOString().slice(0, 10)`, podria retroceder un dia
 * en timezones negativos (UTC-5, etc.).
 */
function formatDateParam(date: Date | null): string | undefined {
  if (!date) return undefined
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Pagina "View all Appointments" — lista paginada con filtros y busqueda.
 *
 * Sigue el mismo patron que ProvidersPage / UsersPage:
 * - Estado de filtros local
 * - buildParams() para construir query params
 * - Debounce en busqueda (300ms)
 * - Handlers que resetean a pagina 1 al cambiar filtro
 *
 * **Diferencias con ProvidersPage:**
 * 1. Mas filtros: status, userId, providerId, locationId, dateFrom, dateTo, search
 * 2. Los dropdowns de User y Provider se cargan desde la API
 *    (hooks useUserOptions y useProviderOptions)
 * 3. El fetch inicial envia status='upcoming' por defecto
 * 4. Dos date pickers (dateFrom, dateTo) que usan react-datepicker
 */
export function AppointmentsPage() {
  // ─── Filter state ──────────────────────────────────────────────────
  const [status, setStatus] = useState<StatusFilter>('')
  const [userId, setUserId] = useState('')
  const [providerId, setProviderId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // ─── Data hooks ───────────────────────────────────────────────────
  const {
    appointments,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchAppointments,
  } = useAppointments()

  const { users } = useUserOptions()
  const { providers } = useProviderOptions()
  const { locations } = useLocationOptions()

  // ─── Debounce ref ──────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Construye los query params a partir del estado actual de filtros.
   * Los valores vacios se convierten a `undefined` para que axios
   * no los incluya en la URL.
   */
  function buildParams(
    overrides?: Partial<{
      page: number
      search: string
      status: StatusFilter
      dateFrom: Date | null
      dateTo: Date | null
    }>,
  ): AppointmentsQueryParams {
    const p = overrides?.page ?? currentPage
    const s = overrides?.search ?? search
    const st = overrides?.status ?? status
    const df = overrides !== undefined && 'dateFrom' in overrides ? overrides.dateFrom : dateFrom
    const dt = overrides !== undefined && 'dateTo' in overrides ? overrides.dateTo : dateTo

    return {
      page: p,
      limit: PAGE_LIMIT,
      status: st || undefined,
      userId: userId || undefined,
      providerId: providerId || undefined,
      locationId: locationId || undefined,
      dateFrom: formatDateParam(df ?? null),
      dateTo: formatDateParam(dt ?? null),
      search: s || undefined,
    }
  }

  // ─── Filter handlers ───────────────────────────────────────────────

  function handleStatusChange(value: StatusFilter) {
    setStatus(value)
    setCurrentPage(1)
    fetchAppointments({ ...buildParams({ page: 1 }), status: value || undefined })
  }

  function handleUserChange(value: string) {
    setUserId(value)
    setCurrentPage(1)
    fetchAppointments({ ...buildParams({ page: 1 }), userId: value || undefined })
  }

  function handleProviderChange(value: string) {
    setProviderId(value)
    setCurrentPage(1)
    fetchAppointments({ ...buildParams({ page: 1 }), providerId: value || undefined })
  }

  function handleLocationChange(value: string) {
    setLocationId(value)
    setCurrentPage(1)
    fetchAppointments({ ...buildParams({ page: 1 }), locationId: value || undefined })
  }

  function handleDateFromChange(date: Date | null) {
    setDateFrom(date)
    setCurrentPage(1)
    fetchAppointments({
      ...buildParams({ page: 1, dateFrom: date }),
    })
  }

  function handleDateToChange(date: Date | null) {
    setDateTo(date)
    setCurrentPage(1)
    fetchAppointments({
      ...buildParams({ page: 1, dateTo: date }),
    })
  }

  /**
   * El search usa debounce: solo hace el request cuando el usuario
   * "para" de escribir por 300ms.
   */
  function handleSearchChange(value: string) {
    setSearch(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchAppointments(buildParams({ page: 1, search: value }))
    }, SEARCH_DEBOUNCE_MS)
  }

  /** Limpia el timer del debounce si el componente se desmonta */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage)
    fetchAppointments(buildParams({ page: newPage }))
  }

  // ─── Action handlers (preparados para implementacion futura) ──────

  function handleEdit(appointment: Appointment) {
    // TODO: Implementar edicion de appointment
    console.log('Edit appointment:', appointment.id)
  }

  function handleDelete(appointment: Appointment) {
    // TODO: Implementar eliminacion de appointment
    console.log('Delete appointment:', appointment.id)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-navy">APPOINTMENTS</h1>

      {/* Filters */}
      <div className="mt-6">
        <AppointmentsFilters
          status={status}
          userId={userId}
          providerId={providerId}
          locationId={locationId}
          dateFrom={dateFrom}
          dateTo={dateTo}
          search={search}
          users={users}
          providers={providers}
          locations={locations}
          onStatusChange={handleStatusChange}
          onUserChange={handleUserChange}
          onProviderChange={handleProviderChange}
          onLocationChange={handleLocationChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-brand-red/20 bg-badge-cancelled-bg px-4 py-3 text-sm text-brand-red"
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mt-4">
        <AppointmentsTable
          appointments={appointments}
          page={page}
          limit={PAGE_LIMIT}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {!isLoading && appointments.length > 0 && (
        <div className="mt-4">
          <AppointmentsPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}
