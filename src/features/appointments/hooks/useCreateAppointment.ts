import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { APPOINTMENT_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError, ApiError } from '@/lib/api-error'
import type { Appointment, CreateAppointmentPayload } from '@/features/appointments/types'

interface UseCreateAppointmentReturn {
  isLoading: boolean
  error: string | null
  fieldErrors: string[]
  createAppointment: (payload: CreateAppointmentPayload) => Promise<Appointment | null>
}

/**
 * Hook de mutación para crear un appointment vía POST /api/admin/appointments.
 *
 * Mismo patrón que `useCreateProvider` y `useCreateUser`:
 * - No ejecuta nada al montarse (no useEffect)
 * - Expone `createAppointment()` que se llama desde el form submit
 * - Retorna Appointment si éxito, null si falla
 * - Guarda error y fieldErrors en el estado para mostrar en la UI
 */
export function useCreateAppointment(): UseCreateAppointmentReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<string[]>([])

  const createAppointment = useCallback(async (payload: CreateAppointmentPayload): Promise<Appointment | null> => {
    setIsLoading(true)
    setError(null)
    setFieldErrors([])

    try {
      const { data } = await apiClient.post<Appointment>(
        APPOINTMENT_ENDPOINTS.CREATE,
        payload,
      )

      return data
    } catch (err) {
      if (isApiError(err)) {
        setError(err.message)

        if (err instanceof ApiError && err.errors.length > 1) {
          setFieldErrors(err.errors)
        }
      } else {
        setError('Failed to create appointment')
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, error, fieldErrors, createAppointment }
}
