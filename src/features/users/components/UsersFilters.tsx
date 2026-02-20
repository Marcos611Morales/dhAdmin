import { IconSearch } from '@tabler/icons-react'
import type { Gender } from '@/features/users/types'

/**
 * Opciones del select de gender.
 *
 * El valor `''` (string vacío) significa "sin filtro" — cuando se selecciona
 * "All", el componente padre envía `undefined` al hook (no incluye el param).
 *
 * Se usa `as const` para que TypeScript infiera los valores literales
 * en vez de `string` genérico. Esto ayuda a mantener type safety.
 */
const GENDER_OPTIONS: { value: Gender | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const EMAIL_VERIFIED_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Not verified' },
]

interface UsersFiltersProps {
  gender: Gender | ''
  emailVerified: string
  search: string
  includeDeleted: boolean
  onGenderChange: (value: Gender | '') => void
  onEmailVerifiedChange: (value: string) => void
  onSearchChange: (value: string) => void
  onIncludeDeletedChange: (value: boolean) => void
}

/**
 * Barra de filtros para la tabla de usuarios.
 *
 * Todos los filtros son "controlled components" — su valor vive en el
 * estado del componente padre (UsersPage), no aquí. UsersFilters solo
 * renderiza los inputs y notifica cambios vía callbacks.
 *
 * ¿Por qué controlled? Porque el componente padre necesita acceder a
 * los valores de todos los filtros para construir los query params
 * del API call. Si cada filtro manejara su propio estado, el padre
 * no tendría forma de saber qué se seleccionó.
 */
export function UsersFilters({
  gender,
  emailVerified,
  search,
  includeDeleted,
  onGenderChange,
  onEmailVerifiedChange,
  onSearchChange,
  onIncludeDeletedChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Gender select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-gender" className="text-xs font-medium text-gray-500">
          Gender
        </label>
        <select
          id="filter-gender"
          value={gender}
          onChange={(e) => onGenderChange(e.target.value as Gender | '')}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy"
        >
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Email Verified select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-email-verified" className="text-xs font-medium text-gray-500">
          Email Verified
        </label>
        <select
          id="filter-email-verified"
          value={emailVerified}
          onChange={(e) => onEmailVerifiedChange(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-navy"
        >
          {EMAIL_VERIFIED_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Include deleted toggle */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-500">Include Deleted</span>
        <label
          htmlFor="filter-include-deleted"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3"
        >
          <input
            id="filter-include-deleted"
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => onIncludeDeletedChange(e.target.checked)}
            className="size-4 rounded border-gray-300 accent-navy"
          />
          <span className="text-sm text-navy">Show deleted</span>
        </label>
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
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
          />
        </div>
      </div>
    </div>
  )
}
