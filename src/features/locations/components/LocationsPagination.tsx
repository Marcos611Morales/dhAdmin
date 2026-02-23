import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

interface LocationsPaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

/**
 * Controles de paginación para la tabla de locations.
 *
 * Muestra: "X total locations" a la izquierda +
 * "Page X of Y" con botones prev/next a la derecha.
 */
export function LocationsPagination({ page, totalPages, total, onPageChange }: LocationsPaginationProps) {
  if (totalPages <= 0) return null

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        <span className="font-medium text-navy">{total.toLocaleString('en-US')}</span> total locations
      </p>

      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">
          Page <span className="font-medium text-navy">{page}</span> of{' '}
          <span className="font-medium text-navy">{totalPages}</span>
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <IconChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="rounded-lg border border-gray-300 p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <IconChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
