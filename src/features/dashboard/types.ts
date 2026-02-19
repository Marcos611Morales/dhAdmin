/**
 * Respuesta de GET /api/admin/dashboard/stats.
 *
 * Contiene contadores generales del sistema que se muestran
 * como tarjetas (stat cards) en la vista de Dashboard.
 */

interface AppointmentsByStatus {
  upcoming: number
  past: number
  cancelled: number
}

export interface DashboardStats {
  totalUsers: number
  totalProviders: number
  totalAppointments: number
  appointmentsByStatus: AppointmentsByStatus
  totalLocations: number
  totalSpecialties: number
}
