import { useAuth } from '@/features/auth'
import { useDashboardStats, StatCard, QuickAccessCard } from '@/features/dashboard'
import {
  IconUsers,
  IconStethoscope,
  IconCalendar,
  IconCalendarEvent,
  IconMapPin,
  IconStar,
  IconQuestionMark,
  IconMail,
} from '@tabler/icons-react'

/**
 * Página principal del dashboard.
 *
 * Se muestra inmediatamente después del login. Compone los componentes
 * del feature `dashboard` para mostrar estadísticas del sistema y
 * accesos rápidos a las diferentes secciones del admin.
 *
 * Las stat cards reciben `isLoading` del hook para mostrar skeletons
 * mientras la API responde. La sección de Quick Access es estática
 * (no depende de datos de la API), así que se renderiza de inmediato.
 */
export function DashboardPage() {
  const { admin } = useAuth()
  const { stats, isLoading, error } = useDashboardStats()

  return (
    <div>
      {/* Page header */}
      <h1 className="text-2xl font-bold text-navy">
        Welcome, {admin?.firstName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here&apos;s an overview of your system
      </p>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-brand-red/20 bg-badge-cancelled-bg px-4 py-3 text-sm text-brand-red"
        >
          {error}
        </div>
      )}

      {/* Stat cards grid */}
      <section aria-label="Dashboard statistics" className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={IconUsers}
            label="Total Users"
            value={stats?.totalUsers ?? 0}
            iconClassName="bg-blue-100 text-blue-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={IconStethoscope}
            label="Total Providers"
            value={stats?.totalProviders ?? 0}
            iconClassName="bg-emerald-100 text-emerald-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={IconCalendar}
            label="Total Appointments"
            value={stats?.totalAppointments ?? 0}
            iconClassName="bg-purple-100 text-purple-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={IconCalendarEvent}
            label="Upcoming Appointments"
            value={stats?.appointmentsByStatus.upcoming ?? 0}
            iconClassName="bg-badge-upcoming-bg text-badge-upcoming-text"
            isLoading={isLoading}
          />
          <StatCard
            icon={IconMapPin}
            label="Total Locations"
            value={stats?.totalLocations ?? 0}
            iconClassName="bg-orange-100 text-orange-600"
            isLoading={isLoading}
          />
          <StatCard
            icon={IconStar}
            label="Total Specialties"
            value={stats?.totalSpecialties ?? 0}
            iconClassName="bg-amber-100 text-amber-600"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Quick access section */}
      <section aria-label="Quick access" className="mt-8">
        <h2 className="text-lg font-bold text-navy">Quick Access</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAccessCard
            icon={IconUsers}
            title="Users"
            description="Manage user accounts"
            to="/admin/users"
          />
          <QuickAccessCard
            icon={IconStethoscope}
            title="Providers"
            description="Manage healthcare providers"
            to="/admin/providers"
          />
          <QuickAccessCard
            icon={IconCalendar}
            title="Appointments"
            description="View and manage appointments"
            to="/admin/appointments"
          />
          <QuickAccessCard
            icon={IconMapPin}
            title="Locations"
            description="Manage service locations"
            to="/admin/locations"
          />
          <QuickAccessCard
            icon={IconStar}
            title="Specialties"
            description="Manage medical specialties"
            to="/admin/specialties"
          />
          <QuickAccessCard
            icon={IconQuestionMark}
            title="FAQs"
            description="Manage frequently asked questions"
            to="/admin/faqs"
          />
          <QuickAccessCard
            icon={IconMail}
            title="Contact Submissions"
            description="View contact form submissions"
            to="/admin/contact-submissions"
          />
        </div>
      </section>
    </div>
  )
}
