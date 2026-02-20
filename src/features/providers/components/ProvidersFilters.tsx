import { IconSearch } from '@tabler/icons-react'
import type { ProviderGender } from '@/features/providers/types'
import type { Specialty } from '@/features/providers/hooks/useSpecialties'
import type { Location } from '@/features/providers/hooks/useLocations'

/**
 * Opciones del select de gender para providers.
 *
 * El usuario pidió solo estos 4 valores (sin "Prefer not to say").
 * El valor `''` (string vacío) significa "sin filtro" (All).
 */
const GENDER_OPTIONS: { value: ProviderGender | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
]

interface ProvidersFiltersProps {
  specialty: string
  location: string
  gender: ProviderGender | ''
  search: string
  specialties: Specialty[]
  locations: Location[]
  onSpecialtyChange: (value: string) => void
  onLocationChange: (value: string) => void
  onGenderChange: (value: ProviderGender | '') => void
  onSearchChange: (value: string) => void
}

/**
 * Barra de filtros para la tabla de providers.
 *
 * Los dropdowns de Specialty y Location se construyen dinámicamente
 * con datos del API (los arrays `specialties` y `locations` vienen
 * del componente padre, que los obtiene con useSpecialties y useLocations).
 *
 * Cada opción de specialty/location usa su UUID como valor — así al
 * seleccionar, el componente padre envía el UUID al API como query param.
 *
 * Todos los filtros son "controlled components" — su valor vive en el
 * estado del componente padre (ProvidersPage), no aquí.
 */
export function ProvidersFilters({
  specialty,
  location,
  gender,
  search,
  specialties,
  locations,
  onSpecialtyChange,
  onLocationChange,
  onGenderChange,
  onSearchChange,
}: ProvidersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Specialty select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-specialty" className="text-xs font-medium text-gray-500">
          Specialty
        </label>
        <select
          id="filter-specialty"
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
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
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy"
        >
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Gender select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-gender" className="text-xs font-medium text-gray-500">
          Gender
        </label>
        <select
          id="filter-gender"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value as ProviderGender | '')}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy"
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search box */}
      <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
        <label htmlFor="filter-search" className="text-xs font-medium text-gray-500">
          Search
        </label>
        <div className="relative">
          <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="filter-search"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
          />
        </div>
      </div>
    </div>
  )
}
