import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { APPOINTMENT_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { Appointment, AppointmentsQueryParams } from '@/features/appointments/types'
import type { PaginatedResponse } from '@/types/api'

interface UseAppointmentsReturn {
  appointments: Appointment[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  fetchAppointments: (params?: AppointmentsQueryParams) => void
}

/**
 * Hook que obtiene la lista paginada de appointments desde la API.
 *
 * Sigue el mismo patrón que `useProviders` y `useUsers`:
 * - Fetch automático al montar (sin filtro de status = trae todos)
 * - Expone `fetchAppointments(params)` para re-ejecutar con nuevos filtros
 * - `useCallback` mantiene la referencia estable
 */
export function useAppointments(): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (params?: AppointmentsQueryParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await apiClient.get<PaginatedResponse<Appointment>>(
        APPOINTMENT_ENDPOINTS.LIST,
        { params },
      )

      setAppointments(data.data)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      const message = isApiError(err)
        ? err.message
        : 'Failed to load appointments'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return { appointments, total, page, totalPages, isLoading, error, fetchAppointments }
}
