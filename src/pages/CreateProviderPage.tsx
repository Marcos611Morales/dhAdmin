import { useState } from 'react'
import { IconLoader2 } from '@tabler/icons-react'
import { useCreateProvider } from '@/features/providers/hooks/useCreateProvider'
import { useSpecialties } from '@/features/providers/hooks/useSpecialties'
import { useLocations } from '@/features/providers/hooks/useLocations'
import { SuccessModal } from '@/components/ui/SuccessModal'
import type { ProviderGender, CreateProviderPayload } from '@/features/providers/types'

/**
 * Opciones del select de gender.
 * Separado del componente para que React no re-cree el array en cada render.
 */
const GENDER_OPTIONS: { value: ProviderGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

/**
 * Interfaz del estado del formulario.
 *
 * Todos los campos son strings porque los inputs HTML trabajan con strings.
 * La conversión al tipo correcto (number, ProviderGender, etc.) se hace
 * al construir el payload antes del submit.
 *
 * `appointmentPrice` es string aquí porque el input type="number" también
 * devuelve strings en `e.target.value`. Se convierte a number con parseFloat
 * antes de enviar al backend.
 */
interface FormState {
  firstName: string
  lastName: string
  title: string
  specialtyId: string
  locationId: string
  gender: ProviderGender | ''
  bio: string
  appointmentPrice: string
  profileImageUrl: string
}

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  title: '',
  specialtyId: '',
  locationId: '',
  gender: '',
  bio: '',
  appointmentPrice: '',
  profileImageUrl: '',
}

/**
 * Errores de validación del formulario.
 * String vacío = sin error.
 */
interface FormErrors {
  firstName: string
  lastName: string
  specialtyId: string
  locationId: string
}

const INITIAL_ERRORS: FormErrors = {
  firstName: '',
  lastName: '',
  specialtyId: '',
  locationId: '',
}

/**
 * Página "Add new Provider" — formulario para crear un provider.
 *
 * Sigue el mismo patrón de formulario controlado que CreateUserPage:
 * - Todos los inputs controlados por React state
 * - Validación client-side antes del submit
 * - Errores del backend mostrados en banner
 * - Modal de éxito al crear exitosamente
 * - Botones Clear Fields + Create Provider centrados
 *
 * Los dropdowns de Specialty y Location se llenan con datos del API
 * usando los hooks `useSpecialties` y `useLocations` que ya existían
 * para los filtros de ProvidersPage.
 */
export function CreateProviderPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)
  const [showSuccess, setShowSuccess] = useState(false)

  const { isLoading, error: apiError, fieldErrors, createProvider } = useCreateProvider()
  const { specialties } = useSpecialties()
  const { locations } = useLocations()

  // ─── Handlers ──────────────────────────────────────────────────────

  /**
   * Handler genérico para inputs de texto.
   * Usa "computed property names" para actualizar el campo dinámicamente.
   */
  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleGenderChange(value: string) {
    setForm((prev) => ({ ...prev, gender: value as ProviderGender | '' }))
  }

  // ─── Validación ────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors = { ...INITIAL_ERRORS }
    let isValid = true

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required'
      isValid = false
    } else if (form.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be 50 characters or less'
      isValid = false
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
      isValid = false
    } else if (form.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be 50 characters or less'
      isValid = false
    }

    if (!form.specialtyId) {
      newErrors.specialtyId = 'Specialty is required'
      isValid = false
    }

    if (!form.locationId) {
      newErrors.locationId = 'Location is required'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // ─── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const payload: CreateProviderPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      specialtyId: form.specialtyId,
      locationId: form.locationId,
    }

    // Solo incluir campos opcionales si tienen valor
    if (form.title.trim()) {
      payload.title = form.title.trim()
    }
    if (form.gender) {
      payload.gender = form.gender
    }
    if (form.bio.trim()) {
      payload.bio = form.bio.trim()
    }
    if (form.appointmentPrice.trim()) {
      const price = parseFloat(form.appointmentPrice.trim())
      if (!isNaN(price) && price >= 0) {
        payload.appointmentPrice = price
      }
    }
    if (form.profileImageUrl.trim()) {
      payload.profileImageUrl = form.profileImageUrl.trim()
    }

    const provider = await createProvider(payload)

    if (provider) {
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
      <h1 className="text-2xl font-bold text-navy">ADD NEW PROVIDER</h1>

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
          {/* Row 1: Title + First Name + Last Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label="Title">
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Dr."
                maxLength={20}
                className={inputClass()}
              />
            </FormField>

            <FormField
              label="First Name"
              required
              error={errors.firstName}
            >
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Sam"
                maxLength={50}
                className={inputClass(errors.firstName)}
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName}
            >
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Peterson"
                maxLength={50}
                className={inputClass(errors.lastName)}
              />
            </FormField>
          </div>

          {/* Row 2: Specialty + Location */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Specialty"
              required
              error={errors.specialtyId}
            >
              <select
                value={form.specialtyId}
                onChange={(e) => handleChange('specialtyId', e.target.value)}
                className={inputClass(errors.specialtyId)}
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Location"
              required
              error={errors.locationId}
            >
              <select
                value={form.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                className={inputClass(errors.locationId)}
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayName}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Row 3: Gender + Appointment Price */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Gender">
              <select
                value={form.gender}
                onChange={(e) => handleGenderChange(e.target.value)}
                className={inputClass()}
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Appointment Price">
              <input
                type="number"
                value={form.appointmentPrice}
                onChange={(e) => handleChange('appointmentPrice', e.target.value)}
                placeholder="80.00"
                min="0"
                step="0.01"
                className={inputClass()}
              />
            </FormField>
          </div>

          {/* Row 4: Bio */}
          <div className="mt-4">
            <FormField label="Biography">
              <textarea
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Board-certified physician with experience in..."
                rows={3}
                className={`${inputClass()} h-auto py-2`}
              />
            </FormField>
          </div>

          {/* Row 5: Profile Image URL */}
          <div className="mt-4">
            <FormField label="Profile Image URL">
              <input
                type="text"
                value={form.profileImageUrl}
                onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={inputClass()}
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
              {isLoading ? 'Creating...' : 'Create Provider'}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <SuccessModal
          title="Provider Created!"
          message="The new provider has been created successfully."
          onConfirm={handleSuccessConfirm}
        />
      )}
    </div>
  )
}

// ─── Sub-componentes internos ──────────────────────────────────────────

/**
 * Genera las clases CSS para un input, adaptando el borde según si hay error.
 */
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

/**
 * Wrapper reutilizable para un campo de formulario.
 * Incluye label, indicador de requerido (*), el input y el mensaje de error.
 */
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
