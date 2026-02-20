import { useEffect, useRef } from 'react'
import { IconX, IconUserCircle } from '@tabler/icons-react'
import type { User } from '@/features/users/types'
import { formatDate, formatGender } from '@/features/users/utils'

interface UserDetailModalProps {
  user: User
  onClose: () => void
}

/**
 * Modal que muestra el detalle de un usuario.
 *
 * Se abre al hacer click en una fila de la tabla de usuarios.
 * Muestra la foto de perfil (o un icono placeholder), datos personales
 * y estado de verificación.
 *
 * **Foco gestionado (accesibilidad):**
 * Cuando el modal se abre, el foco se mueve al botón de cerrar.
 * Esto es importante para usuarios de teclado/screen readers — sin esto,
 * el foco quedaría "atrapado" detrás del overlay y el usuario no sabría
 * que hay un modal abierto.
 *
 * El `useRef` crea una referencia al botón de cerrar. `useEffect` llama
 * `.focus()` en el primer render del modal. El ref persiste entre renders
 * sin causar re-renders (a diferencia de useState).
 *
 * El overlay (fondo oscuro) cierra el modal al hacer click, y la tecla
 * Escape también lo cierra, siguiendo el patrón estándar de modales.
 */
export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`User details: ${user.firstName} ${user.lastName}`}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <IconX size={20} />
        </button>

        {/* Profile image + name */}
        <div className="flex flex-col items-center">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="size-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-gray-100">
              <IconUserCircle size={48} className="text-gray-400" />
            </div>
          )}
          <h2 className="mt-4 text-xl font-bold text-navy">
            {user.firstName} {user.middleName && `${user.middleName} `}{user.lastName}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Details grid */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <DetailItem label="Date of Birth" value={formatDate(user.dateOfBirth)} />
          <DetailItem label="Gender" value={formatGender(user.gender)} />
          <DetailItem
            label="Email Verified"
            value={user.isEmailVerified ? 'Verified' : 'Not verified'}
            className={user.isEmailVerified ? 'text-emerald-600' : 'text-brand-red'}
          />
          <DetailItem label="Created" value={formatDate(user.createdAt)} />
          {user.deletedAt && (
            <DetailItem
              label="Deleted"
              value={formatDate(user.deletedAt)}
              className="text-brand-red"
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-componente interno ──────────────────────────────────────────

interface DetailItemProps {
  label: string
  value: string
  className?: string
}

function DetailItem({ label, value, className }: DetailItemProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${className ?? 'text-navy'}`}>
        {value}
      </p>
    </div>
  )
}
