export function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex justify-center">
          <img
            src="/Logo2.png"
            alt="DirectHealth logo"
            className="h-12 w-12"
          />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-navy">
          DirectHealth Admin
        </h1>

        <p className="mb-6 text-center text-sm text-gray-500">
          Super Admin Panel — Development Build
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <span className="inline-flex rounded-full bg-badge-available-bg px-2.5 py-0.5 text-xs font-semibold text-badge-available-text">
              OK
            </span>
            <span className="text-sm text-navy">Tailwind CSS v4 active</span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <span className="inline-flex rounded-full bg-badge-upcoming-bg px-2.5 py-0.5 text-xs font-semibold text-badge-upcoming-text">
              OK
            </span>
            <span className="text-sm text-navy">Design tokens loaded</span>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
            <span className="inline-flex rounded-full bg-badge-booked-bg px-2.5 py-0.5 text-xs font-semibold text-badge-booked-text">
              OK
            </span>
            <span className="text-sm text-navy">Inter font family</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="h-10 flex-1 rounded-lg bg-navy text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Primary
          </button>
          <button
            type="button"
            className="h-10 flex-1 rounded-lg border border-gray-200 bg-white text-sm font-medium text-navy transition-opacity hover:opacity-85"
          >
            Secondary
          </button>
          <button
            type="button"
            className="h-10 flex-1 rounded-lg border border-brand-red bg-white text-sm font-medium text-brand-red transition-opacity hover:opacity-85"
          >
            Negative
          </button>
        </div>
      </div>
    </main>
  )
}
