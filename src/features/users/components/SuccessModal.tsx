import { useEffect, useRef } from 'react'
import { IconCircleCheck } from '@tabler/icons-react'

interface SuccessModalProps {
  title: string
  message: string
  onConfirm: () => void
}

/**
 * Modal de éxito genérico.
 *
 * Muestra un ícono verde de check, un título, un mensaje y un botón "Ok".
 * Se usa después de operaciones exitosas (ej: crear un usuario) para
 * confirmarle al usuario que la acción se completó correctamente.
 *
 * Sigue el mismo patrón de accesibilidad que UserDetailModal:
 * - Focus automático en el botón "Ok" al abrirse (keyboard-friendly)
 * - Escape cierra el modal
 * - Click en el overlay cierra el modal
 * - `role="dialog"` y `aria-modal` para screen readers
 */
export function SuccessModal({ title, message, onConfirm }: SuccessModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onConfirm()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onConfirm])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onConfirm}
      role="presentation"
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-50">
            <IconCircleCheck size={40} className="text-emerald-500" />
          </div>
        </div>

        {/* Title and message */}
        <h2 className="mt-4 text-lg font-bold text-navy">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{message}</p>

        {/* Ok button */}
        <button
          ref={confirmButtonRef}
          type="button"
          onClick={onConfirm}
          className="mt-6 w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          Ok
        </button>
      </div>
    </div>
  )
}
