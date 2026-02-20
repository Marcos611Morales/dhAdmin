import { useState, useEffect, useRef } from 'react'
import { useProviders } from '@/features/providers'
import { useSpecialties } from '@/features/providers/hooks/useSpecialties'
import { useLocations } from '@/features/providers/hooks/useLocations'
import type { Provider, ProviderGender, ProvidersQueryParams } from '@/features/providers'
import { ProvidersFilters } from '@/features/providers/components/ProvidersFilters'
import { ProvidersTable } from '@/features/providers/components/ProvidersTable'
import { ProvidersPagination } from '@/features/providers/components/ProvidersPagination'

/** Items por página — coincide con el default del backend */
const PAGE_LIMIT = 50

/** Milisegundos de espera antes de ejecutar la búsqueda (debounce) */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Página "View all Providers" — lista paginada con filtros y búsqueda.
 *
 * Sigue el mismo patrón que UsersPage:
 * - Estado de filtros local
 * - buildParams() para construir query params
 * - Debounce en búsqueda (300ms)
 * - Handlers que resetean a página 1 al cambiar filtro
 *
 * **Diferencia con UsersPage:**
 * Los filtros de Specialty y Location necesitan datos del API (UUIDs),
 * así que usamos `useSpecialties()` y `useLocations()` para obtener
 * las listas de opciones. Los dropdowns se construyen dinámicamente
 * con los datos del fetch en vez de ser hardcoded.
 */
export function ProvidersPage() {
  // ─── Filter state ──────────────────────────────────────────────────
  const [specialty, setSpecialty] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState<ProviderGender | ''>('')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // ─── Data hooks ───────────────────────────────────────────────────
  const { providers, total, page, totalPages, isLoading, error, fetchProviders } = useProviders()
  const { specialties } = useSpecialties()
  const { locations } = useLocations()

  // ─── Debounce ref ──────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Construye los query params a partir del estado actual de filtros.
   * Los valores vacíos se convierten a `undefined` para que axios
   * no los incluya en la URL.
   */
  function buildParams(overrides?: Partial<{ page: number; search: string }>): ProvidersQueryParams {
    const p = overrides?.page ?? currentPage
    const s = overrides?.search ?? search

    return {
      page: p,
      limit: PAGE_LIMIT,
      specialty: specialty || undefined,
      location: location || undefined,
      gender: gender || undefined,
      search: s || undefined,
    }
  }

  // ─── Filter handlers ───────────────────────────────────────────────

  function handleSpecialtyChange(value: string) {
    setSpecialty(value)
    setCurrentPage(1)
    fetchProviders({ ...buildParams({ page: 1 }), specialty: value || undefined })
  }

  function handleLocationChange(value: string) {
    setLocation(value)
    setCurrentPage(1)
    fetchProviders({ ...buildParams({ page: 1 }), location: value || undefined })
  }

  function handleGenderChange(value: ProviderGender | '') {
    setGender(value)
    setCurrentPage(1)
    fetchProviders({ ...buildParams({ page: 1 }), gender: value || undefined })
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
      fetchProviders(buildParams({ page: 1, search: value }))
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
    fetchProviders(buildParams({ page: newPage }))
  }

  // ─── Action handlers (preparados para implementación futura) ──────

  function handleEdit(provider: Provider) {
    // TODO: Implementar edición de provider
    console.log('Edit provider:', provider.id)
  }

  function handleDelete(provider: Provider) {
    // TODO: Implementar eliminación de provider
    console.log('Delete provider:', provider.id)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-navy">PROVIDERS</h1>

      {/* Filters */}
      <div className="mt-6">
        <ProvidersFilters
          specialty={specialty}
          location={location}
          gender={gender}
          search={search}
          specialties={specialties}
          locations={locations}
          onSpecialtyChange={handleSpecialtyChange}
          onLocationChange={handleLocationChange}
          onGenderChange={handleGenderChange}
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
        <ProvidersTable
          providers={providers}
          page={page}
          limit={PAGE_LIMIT}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {!isLoading && providers.length > 0 && (
        <div className="mt-4">
          <ProvidersPagination
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
