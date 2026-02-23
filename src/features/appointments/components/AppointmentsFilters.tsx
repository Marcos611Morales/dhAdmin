import DatePicker from 'react-datepicker'
import { IconSearch } from '@tabler/icons-react'
import type { StatusFilter } from '@/features/appointments/types'
import type { UserOption } from '@/features/appointments/hooks/useUserOptions'
import type { ProviderOption } from '@/features/appointments/hooks/useProviderOptions'
import type { LocationOption } from '@/features/appointments/hooks/useLocationOptions'

/**
 * Opciones del select de status.
 * El valor '' (string vacío) significa "sin filtro" (All) —
 * no se envía status en la query y el backend retorna todos.
 */
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
]

interface AppointmentsFiltersProps {
  status: StatusFilter
  userId: string
  providerId: string
  locationId: string
  dateFrom: Date | null
  dateTo: Date | null
  search: string
  users: UserOption[]
  providers: ProviderOption[]
  locations: LocationOption[]
  onStatusChange: (value: StatusFilter) => void
  onUserChange: (value: string) => void
  onProviderChange: (value: string) => void
  onLocationChange: (value: string) => void
  onDateFromChange: (date: Date | null) => void
  onDateToChange: (date: Date | null) => void
  onSearchChange: (value: string) => void
}

/**
 * Barra de filtros para la tabla de appointments.
 *
 * 7 filtros en una sola fila (flex-wrap para pantallas pequeñas):
 * Status, User, Provider, Location, Date From, Date To, Search
 *
 * Los dropdowns de User, Provider y Location se llenan con datos del API
 * (los arrays vienen del componente padre que los obtiene con hooks).
 *
 * Los date pickers usan `react-datepicker` (ya instalado en el proyecto,
 * se usa en CreateUserPage para el campo Date of Birth).
 *
 * Todos los filtros son "controlled components" — su valor vive
 * en el estado del componente padre (AppointmentsPage).
 */
export function AppointmentsFilters({
  status,
  userId,
  providerId,
  locationId,
  dateFrom,
  dateTo,
  search,
  users,
  providers,
  locations,
  onStatusChange,
  onUserChange,
  onProviderChange,
  onLocationChange,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
}: AppointmentsFiltersProps) {
  /** Clases reutilizadas para todos los selects */
  const selectClass =
    'h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy'

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Status select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-status" className="text-xs font-medium text-gray-500">
          Status
        </label>
        <select
          id="filter-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={selectClass}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* User select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-user" className="text-xs font-medium text-gray-500">
          Patient
        </label>
        <select
          id="filter-user"
          value={userId}
          onChange={(e) => onUserChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Patients</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Provider select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-provider" className="text-xs font-medium text-gray-500">
          Provider
        </label>
        <select
          id="filter-provider"
          value={providerId}
          onChange={(e) => onProviderChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Providers</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Location select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-location" className="text-xs font-medium text-gray-500">
          Location
        </label>
        <select
          id="filter-location"
          value={locationId}
          onChange={(e) => onLocationChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Date From */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-date-from" className="text-xs font-medium text-gray-500">
          Date From
        </label>
        <DatePicker
          id="filter-date-from"
          selected={dateFrom}
          onChange={onDateFromChange}
          selectsStart
          startDate={dateFrom}
          endDate={dateTo}
          maxDate={dateTo ?? undefined}
          placeholderText="Start date"
          dateFormat="MM/dd/yyyy"
          isClearable
          className={selectClass}
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-date-to" className="text-xs font-medium text-gray-500">
          Date To
        </label>
        <DatePicker
          id="filter-date-to"
          selected={dateTo}
          onChange={onDateToChange}
          selectsEnd
          startDate={dateFrom}
          endDate={dateTo}
          minDate={dateFrom ?? undefined}
          placeholderText="End date"
          dateFormat="MM/dd/yyyy"
          isClearable
          className={selectClass}
        />
      </div>

      {/* Search box */}
      <div className="flex w-48 flex-col gap-1.5">
        <label htmlFor="filter-search" className="text-xs font-medium text-gray-500">
          Search
        </label>
        <div className="relative">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            id="filter-search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
          />
        </div>
      </div>
    </div>
  )
}
