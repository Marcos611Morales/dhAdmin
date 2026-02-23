import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { useCreateLocation } from '@/features/locations/hooks/useCreateLocation'
import { SuccessModal } from '@/components/ui/SuccessModal'
import type { CreateLocationPayload } from '@/features/locations/types'

/**
 * Estado del formulario.
 *
 * Solo dos campos editables: `city` y `state`.
 * `displayName` se genera automáticamente como "city, state"
 * al hacer submit — el usuario no lo escribe.
 */
interface FormState {
  city: string
  state: string
}

const INITIAL_FORM: FormState = {
  city: '',
  state: '',
}

interface FormErrors {
  city: string
  state: string
}

const INITIAL_ERRORS: FormErrors = {
  city: '',
  state: '',
}

/**
 * Página "Add new Location" — formulario para crear una nueva location.
 *
 * Campos:
 * - City (required, max 100 chars)
 * - State (required, exactamente 2 chars — código de estado, ej: "VA")
 *
 * `displayName` se construye como "city, STATE" y se envía al backend
 * automáticamente. El usuario no necesita escribirlo.
 */
export function CreateLocationPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)
  const [showSuccess, setShowSuccess] = useState(false)

  const { isLoading, error: apiError, fieldErrors, createLocation } = useCreateLocation()

  // ─── Handlers ──────────────────────────────────────────────────────

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // ─── Validación ────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors = { ...INITIAL_ERRORS }
    let isValid = true

    if (!form.city.trim()) {
      newErrors.city = 'City is required'
      isValid = false
    } else if (form.city.trim().length > 100) {
      newErrors.city = 'City must be 100 characters or less'
      isValid = false
    }

    if (!form.state.trim()) {
      newErrors.state = 'State is required'
      isValid = false
    } else if (form.state.trim().length !== 2) {
      newErrors.state = 'State must be exactly 2 characters (e.g. VA)'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // ─── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const city = form.city.trim()
    const state = form.state.trim().toUpperCase()

    const payload: CreateLocationPayload = {
      city,
      state,
      displayName: `${city}, ${state}`,
    }

    const location = await createLocation(payload)

    if (location) {
      setShowSuccess(true)
    }
  }

  function handleSuccessConfirm() {
    setShowSuccess(false)
    setForm(INITIAL_FORM)
    setErrors(INITIAL_ERRORS)
  }

  function handleClearFields() {
    setForm(INITIAL_FORM)
    setErrors(INITIAL_ERRORS)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-navy">ADD NEW LOCATION</h1>

      {/* Form card */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
        {/* API error banner */}
        {apiError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-brand-red/20 bg-badge-cancelled-bg px-4 py-3 text-sm text-brand-red"
          >
            <p className="font-medium">{apiError}</p>
            {fieldErrors.length > 1 && (
              <ul className="mt-2 list-inside list-disc">
                {fieldErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row: City + State */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="City" required error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Hurley"
                maxLength={100}
                className={inputClass(errors.city)}
              />
            </FormField>

            <FormField label="State" required error={errors.state}>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g. VA"
                maxLength={2}
                className={inputClass(errors.state)}
              />
            </FormField>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleClearFields}
              disabled={isLoading}
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-navy transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear Fields
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && (
                <IconLoader2 size={18} className="animate-spin" />
              )}
              {isLoading ? 'Creating...' : 'Create Location'}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <SuccessModal
          title="Location Created!"
          message="The new location has been created successfully."
          onConfirm={handleSuccessConfirm}
        />
      )}
    </div>
  )
}

// ─── Sub-componentes internos ──────────────────────────────────────────

function inputClass(error?: string): string {
  const base =
    'h-10 w-full rounded-lg border bg-white px-3 text-sm text-navy outline-none transition-colors placeholder:text-gray-400 focus:border-navy'
  return error
    ? `${base} border-brand-red`
    : `${base} border-gray-300`
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="ml-0.5 text-brand-red">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-brand-red">{error}</p>
      )}
    </div>
  )
}
