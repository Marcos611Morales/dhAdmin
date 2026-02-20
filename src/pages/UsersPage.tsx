import { useState, useEffect, useRef } from 'react'
import { useUsers } from '@/features/users'
import type { User, UsersQueryParams, Gender } from '@/features/users'
import { UsersFilters } from '@/features/users/components/UsersFilters'
import { UsersTable } from '@/features/users/components/UsersTable'
import { UsersPagination } from '@/features/users/components/UsersPagination'
import { UserDetailModal } from '@/features/users/components/UserDetailModal'

/** Items por página — coincide con el default del backend */
const PAGE_LIMIT = 50

/** Milisegundos de espera antes de ejecutar la búsqueda (debounce) */
const SEARCH_DEBOUNCE_MS = 300

/**
 * Página "View all users" — lista paginada con filtros y búsqueda.
 *
 * **Estado de filtros:**
 * Los filtros (gender, emailVerified, search, includeDeleted) viven aquí
 * como estado local. Cuando cualquiera cambia, se construye un nuevo
 * objeto `UsersQueryParams` y se llama `fetchUsers(params)`.
 *
 * **Debounce en búsqueda:**
 * El search box no dispara un request en cada tecla que escribe el usuario.
 * En su lugar, se usa un `setTimeout` que espera 300ms después de la última
 * tecla. Si el usuario sigue escribiendo antes de que pasen los 300ms,
 * el timer anterior se cancela (`clearTimeout`) y se inicia uno nuevo.
 * Esto reduce la cantidad de requests a la API dramáticamente.
 *
 * `useRef` se usa para guardar el ID del timer entre renders. A diferencia
 * de `useState`, cambiar un ref NO causa re-render — perfecto para datos
 * internos que no afectan la UI directamente.
 *
 * **`selectedUser`:**
 * Controla si el modal de detalle está abierto. `null` = cerrado.
 * Al hacer click en una fila, se guarda el `User` completo, y el modal
 * lo muestra. Al cerrar, se vuelve a `null`.
 */
export function UsersPage() {
  // ─── Filter state ──────────────────────────────────────────────────
  const [gender, setGender] = useState<Gender | ''>('')
  const [emailVerified, setEmailVerified] = useState('')
  const [search, setSearch] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // ─── Data hook ─────────────────────────────────────────────────────
  const { users, total, page, totalPages, isLoading, error, fetchUsers } = useUsers()

  // ─── Modal state ───────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // ─── Debounce ref ──────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Construye los query params a partir del estado actual de filtros.
   *
   * Los valores "vacíos" (string vacío, false) se convierten a `undefined`
   * para que axios no los incluya en la URL. Ejemplo:
   * gender="" → no enviar param → el backend no filtra por gender.
   */
  function buildParams(overrides?: Partial<{ page: number; search: string }>): UsersQueryParams {
    const p = overrides?.page ?? currentPage
    const s = overrides?.search ?? search

    return {
      page: p,
      limit: PAGE_LIMIT,
      gender: gender || undefined,
      isEmailVerified: emailVerified === '' ? undefined : emailVerified === 'true',
      search: s || undefined,
      includeDeleted: includeDeleted || undefined,
    }
  }

  // ─── Filter handlers ───────────────────────────────────────────────

  function handleGenderChange(value: Gender | '') {
    setGender(value)
    setCurrentPage(1)
    fetchUsers({ ...buildParams({ page: 1 }), gender: value || undefined })
  }

  function handleEmailVerifiedChange(value: string) {
    setEmailVerified(value)
    setCurrentPage(1)
    fetchUsers({
      ...buildParams({ page: 1 }),
      isEmailVerified: value === '' ? undefined : value === 'true',
    })
  }

  function handleIncludeDeletedChange(value: boolean) {
    setIncludeDeleted(value)
    setCurrentPage(1)
    fetchUsers({ ...buildParams({ page: 1 }), includeDeleted: value || undefined })
  }

  /**
   * El search usa debounce: en vez de llamar fetchUsers inmediatamente,
   * programa un setTimeout. Si el usuario escribe otra letra antes de
   * que el timer expire, se cancela el timer anterior con clearTimeout
   * y se crea uno nuevo. Así solo se hace el request cuando el usuario
   * "para" de escribir por 300ms.
   */
  function handleSearchChange(value: string) {
    setSearch(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchUsers(buildParams({ page: 1, search: value }))
    }, SEARCH_DEBOUNCE_MS)
  }

  /**
   * Limpia el timer del debounce si el componente se desmonta
   * mientras hay un timer pendiente. Sin esto, el setTimeout
   * se ejecutaría e intentaría llamar fetchUsers en un componente
   * que ya no existe.
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage)
    fetchUsers(buildParams({ page: newPage }))
  }

  // ─── Action handlers (preparados para implementación futura) ──────

  function handleEdit(user: User) {
    // TODO: Implementar edición de usuario
    console.log('Edit user:', user.id)
  }

  function handleDelete(user: User) {
    // TODO: Implementar eliminación de usuario
    console.log('Delete user:', user.id)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page title */}
      <h1 className="text-2xl font-bold text-navy">USERS</h1>

      {/* Filters */}
      <div className="mt-6">
        <UsersFilters
          gender={gender}
          emailVerified={emailVerified}
          search={search}
          includeDeleted={includeDeleted}
          onGenderChange={handleGenderChange}
          onEmailVerifiedChange={handleEmailVerifiedChange}
          onSearchChange={handleSearchChange}
          onIncludeDeletedChange={handleIncludeDeletedChange}
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
        <UsersTable
          users={users}
          page={page}
          limit={PAGE_LIMIT}
          isLoading={isLoading}
          onRowClick={setSelectedUser}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="mt-4">
          <UsersPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  )
}
