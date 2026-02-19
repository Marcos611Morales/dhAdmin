import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { DASHBOARD_ENDPOINTS } from '@/lib/api-endpoints'
import { isApiError } from '@/lib/api-error'
import type { DashboardStats } from '@/features/dashboard/types'

interface UseDashboardStatsReturn {
  stats: DashboardStats | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook que obtiene las estadísticas del dashboard desde la API.
 *
 * A diferencia de `useSignIn` (que se dispara manualmente con un submit),
 * este hook usa `useEffect` para hacer el fetch automáticamente cuando
 * el componente se monta. Esto es el patrón estándar para cargar datos
 * que se necesitan apenas aparece la pantalla.
 *
 * El flag `cancelled` dentro del useEffect es para evitar "race conditions":
 * si el componente se desmonta antes de que el fetch termine (por ejemplo,
 * el usuario navega a otra página rápidamente), el flag evita que se intente
 * actualizar el estado de un componente que ya no existe.
 *
 * ```tsx
 * function DashboardPage() {
 *   const { stats, isLoading, error } = useDashboardStats()
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage message={error} />
 *   return <StatCards stats={stats} />
 * }
 * ```
 */
export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const { data } = await apiClient.get<DashboardStats>(
          DASHBOARD_ENDPOINTS.STATS,
        )
        if (!cancelled) {
          setStats(data)
        }
      } catch (err) {
        if (!cancelled) {
          const message = isApiError(err)
            ? err.message
            : 'Failed to load dashboard stats'
          setError(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  return { stats, isLoading, error }
}
