import { IconEdit, IconTrash } from '@tabler/icons-react'
import type { User } from '@/features/users/types'
import { formatDate, formatGender } from '@/features/users/utils'

interface UsersTableProps {
  users: User[]
  /** Página actual (1-based), para calcular el número de fila (Count) */
  page: number
  /** Items por página, para calcular el offset del Count */
  limit: number
  isLoading: boolean
  onRowClick: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

/**
 * Tabla de usuarios con columnas fijas.
 *
 * La columna "Count" muestra un número correlativo basado en la página actual:
 * página 1 → 1, 2, 3... / página 2 → 51, 52, 53... (con limit=50).
 * La fórmula es: (page - 1) * limit + index + 1.
 *
 * Los botones de Edit y Delete usan `e.stopPropagation()` para evitar
 * que el click se propague a la fila (que abre el modal de detalle).
 * Sin esto, al hacer click en "Edit", también se abriría el modal.
 */
export function UsersTable({
  users,
  page,
  limit,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
}: UsersTableProps) {
  if (isLoading) {
    return <TableSkeleton />
  }

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">No users found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-600">#</th>
            <th className="px-4 py-3 font-semibold text-gray-600">First Name</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Middle Name</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Last Name</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Date of Birth</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Gender</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Email Verified</th>
            <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              onClick={() => onRowClick(user)}
              className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
            >
              <td className="px-4 py-3 text-gray-500">
                {(page - 1) * limit + index + 1}
              </td>
              <td className="px-4 py-3 font-medium text-navy">{user.firstName}</td>
              <td className="px-4 py-3 text-gray-500">{user.middleName ?? ''}</td>
              <td className="px-4 py-3 font-medium text-navy">{user.lastName}</td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(user.dateOfBirth)}</td>
              <td className="px-4 py-3 text-gray-600">{formatGender(user.gender)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.isEmailVerified
                      ? 'bg-badge-available-bg text-badge-available-text'
                      : 'bg-badge-cancelled-bg text-badge-cancelled-text'
                  }`}
                >
                  {user.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(user)
                    }}
                    title="Edit user"
                    aria-label={`Edit ${user.firstName} ${user.lastName}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(user)
                    }}
                    title="Delete user"
                    aria-label={`Delete ${user.firstName} ${user.lastName}`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-brand-red"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
