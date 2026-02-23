import { useState, useEffect, useRef } from 'react'
import { IconSearch } from '@tabler/icons-react'
import { useLocations } from '@/features/locations'
import type { Location, LocationsQueryParams } from '@/features/locations'
import { LocationsTable } from '@/features/locations/components/LocationsTable'
import { LocationsPagination } from '@/features/locations/components/LocationsPagination'

/** Items por página — coincide con el default del backend */
const PAGE_LIMIT = 50

/** Milisegundos de espera antes de ejecutar la búsqueda (debounce) */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Página "View Locations" — lista paginada con búsqueda.
 *
 * Sigue el mismo patrón que UsersPage pero más simple:
 * solo tiene un filtro de búsqueda (search) y paginación.
 */
export function LocationsPage() {
  // ─── Filter state ──────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // ─── Data hook ─────────────────────────────────────────────────────
  const { locations, total, page, totalPages, isLoading, error, fetchLocations } = useLocations()

  // ─── Debounce ref ──────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Construye los query params a partir del estado actual de filtros.
   * Los valores vacíos se convierten a `undefined` para que axios los omita.
   */
  function buildParams(overrides?: Partial<{ page: number; search: string }>): LocationsQueryParams {
    const p = overrides?.page ?? currentPage
    const s = overrides?.search ?? search

    return {
      page: p,
      limit: PAGE_LIMIT,
      search: s || undefined,
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────

  function handleSearchChange(value: string) {
    setSearch(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchLocations(buildParams({ page: 1, search: value }))
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage)
    fetchLocations(buildParams({ page: newPage }))
  }

  // ─── Action handlers (placeholder) ────────────────────────────────

  function handleEdit(location: Location) {
    // TODO: Implementar edición de location
    console.log('Edit location:', location.id)
  }

  function handleDelete(location: Location) {
    // TODO: Implementar eliminación de location
    console.log('Delete location:', location.id)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">LOCATIONS</h1>

      {/* Search */}
      <div className="mt-6">
        <div className="relative w-64">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by city or state..."
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy"
          />
        </div>
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
        <LocationsTable
          locations={locations}
          page={page}
          limit={PAGE_LIMIT}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {!isLoading && locations.length > 0 && (
        <div className="mt-4">
          <LocationsPagination
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
