import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { providerTimeSlotsUrl } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { TimeSlot } from '@/features/appointments/types'
import type { PaginatedResponse } from '@/types/api'

interface UseTimeSlotsReturn {
  timeSlots: TimeSlot[]
  isLoading: boolean
  fetchTimeSlots: (providerId: string, date: string) => void
  clearTimeSlots: () => void
}

/**
 * Hook que obtiene los time slots disponibles de un provider para una fecha.
 *
 * A diferencia de los hooks de dropdown (useUserOptions, etc.), este no
 * se ejecuta al montar. Se llama manualmente cuando el usuario selecciona
 * un provider Y una fecha, pasando ambos valores a `fetchTimeSlots()`.
 *
 * Filtra por `status=available` para mostrar solo los slots que pueden
 * usarse al crear un appointment.
 *
 * `clearTimeSlots()` se usa cuando el usuario cambia el provider o limpia
 * la fecha — resetea la lista para que no se muestren slots del provider
 * anterior.
 */
export function useTimeSlots(): UseTimeSlotsReturn {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTimeSlots = useCallback(async (providerId: string, date: string) => {
    setIsLoading(true)

    try {
      const { data } = await apiClient.get<PaginatedResponse<TimeSlot>>(
        providerTimeSlotsUrl(providerId),
        { params: { date, status: 'available', limit: 50 } },
      )

      setTimeSlots(data.data)
    } catch (err) {
      const message = isApiError(err) ? err.message : 'Failed to load time slots'
      console.error(message)
      setTimeSlots([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearTimeSlots = useCallback(() => {
    setTimeSlots([])
  }, [])

  return { timeSlots, isLoading, fetchTimeSlots, clearTimeSlots }
}
