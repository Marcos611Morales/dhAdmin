import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { IconLoader2 } from '@tabler/icons-react'
import { useUserOptions } from '@/features/appointments/hooks/useUserOptions'
import { useProviderOptions } from '@/features/appointments/hooks/useProviderOptions'
import { useLocationOptions } from '@/features/appointments/hooks/useLocationOptions'
import { useTimeSlots } from '@/features/appointments/hooks/useTimeSlots'
import { useCreateAppointment } from '@/features/appointments/hooks/useCreateAppointment'
import { SuccessModal } from '@/components/ui/SuccessModal'
import type { CreateAppointmentPayload } from '@/features/appointments/types'

/**
 * Interfaz del estado del formulario.
 *
 * Todos los campos son strings excepto `appointmentDate` que es `Date | null`
 * porque react-datepicker trabaja con objetos Date.
 *
 * `appointmentTime` es string en formato HH:MM — se auto-llena cuando el
 * usuario selecciona un time slot, o puede escribirlo manualmente.
 */
interface FormState {
  userId: string
  providerId: string
  locationId: string
  appointmentDate: Date | null
  appointmentTime: string
  timeSlotId: string
  reason: string
  notes: string
}

const INITIAL_FORM: FormState = {
  userId: '',
  providerId: '',
  locationId: '',
  appointmentDate: null,
  appointmentTime: '',
  timeSlotId: '',
  reason: '',
  notes: '',
}

/**
 * Errores de validación client-side.
 * String vacío = sin error.
 */
interface FormErrors {
  userId: string
  providerId: string
  locationId: string
  appointmentDate: string
  appointmentTime: string
}

const INITIAL_ERRORS: FormErrors = {
  userId: '',
  providerId: '',
  locationId: '',
  appointmentDate: '',
  appointmentTime: '',
}

/**
 * Formatea un Date a string 'YYYY-MM-DD' para enviar al backend.
 *
 * Usa métodos locales (no UTC) porque el DatePicker devuelve un Date
 * basado en el timezone local del navegador.
 */
function formatDateForApi(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Página "Create Appointment" — formulario para crear un nuevo appointment.
 *
 * Sigue el mismo patrón de formulario controlado que CreateProviderPage:
 * - Todos los inputs controlados por React state
 * - Validación client-side antes del submit
 * - Errores del backend mostrados en banner
 * - Modal de éxito al crear exitosamente
 *
 * **Flujo del time slot:**
 * 1. El usuario selecciona un Provider
 * 2. El usuario selecciona una Appointment Date
 * 3. Cuando ambos están seleccionados, se cargan los time slots disponibles
 *    (GET /api/admin/providers/:id/time-slots?date=YYYY-MM-DD&status=available)
 * 4. Al seleccionar un time slot, se auto-llena el campo Appointment Time
 *    con el `startTime` del slot
 * 5. Si no hay slots disponibles, el usuario puede escribir la hora manualmente
 */
export function CreateAppointmentPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)
  const [showSuccess, setShowSuccess] = useState(false)

  const { users } = useUserOptions()
  const { providers } = useProviderOptions()
  const { locations } = useLocationOptions()
  const { timeSlots, isLoading: slotsLoading, fetchTimeSlots, clearTimeSlots } = useTimeSlots()
  const { isLoading, error: apiError, fieldErrors, createAppointment } = useCreateAppointment()

  // ─── Helpers ────────────────────────────────────────────────────────

  /**
   * Carga time slots cuando provider Y fecha están seleccionados.
   * Se llama desde handleProviderChange y handleDateChange.
   */
  function loadTimeSlotsIfReady(providerId: string, date: Date | null) {
    if (providerId && date) {
      fetchTimeSlots(providerId, formatDateForApi(date))
    } else {
      clearTimeSlots()
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleProviderChange(value: string) {
    setForm((prev) => ({ ...prev, providerId: value, timeSlotId: '', appointmentTime: '' }))
    setErrors((prev) => ({ ...prev, providerId: '' }))
    loadTimeSlotsIfReady(value, form.appointmentDate)
  }

  function handleDateChange(date: Date | null) {
    setForm((prev) => ({ ...prev, appointmentDate: date, timeSlotId: '', appointmentTime: '' }))
    setErrors((prev) => ({ ...prev, appointmentDate: '' }))
    loadTimeSlotsIfReady(form.providerId, date)
  }

  /**
   * Al seleccionar un time slot, auto-llena el campo appointmentTime
   * con el startTime del slot seleccionado.
   */
  function handleTimeSlotChange(value: string) {
    const selectedSlot = timeSlots.find((s) => s.id === value)
    setForm((prev) => ({
      ...prev,
      timeSlotId: value,
      appointmentTime: selectedSlot ? selectedSlot.startTime.slice(0, 5) : prev.appointmentTime,
    }))
    setErrors((prev) => ({ ...prev, appointmentTime: '' }))
  }

  // ─── Validación ────────────────────────────────────────────────────

  function validate(): boolean {
    const newErrors = { ...INITIAL_ERRORS }
    let isValid = true

    if (!form.userId) {
      newErrors.userId = 'Patient is required'
      isValid = false
    }

    if (!form.providerId) {
      newErrors.providerId = 'Provider is required'
      isValid = false
    }

    if (!form.locationId) {
      newErrors.locationId = 'Location is required'
      isValid = false
    }

    if (!form.appointmentDate) {
      newErrors.appointmentDate = 'Date is required'
      isValid = false
    }

    if (!form.appointmentTime.trim()) {
      newErrors.appointmentTime = 'Time is required'
      isValid = false
    } else {
      // Validar formato HH:MM
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
      if (!timeRegex.test(form.appointmentTime.trim())) {
        newErrors.appointmentTime = 'Time must be in HH:MM format (e.g. 10:00)'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // ─── Submit ────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const payload: CreateAppointmentPayload = {
      userId: form.userId,
      providerId: form.providerId,
      locationId: form.locationId,
      appointmentDate: formatDateForApi(form.appointmentDate!),
      appointmentTime: form.appointmentTime.trim(),
    }

    if (form.timeSlotId) {
      payload.timeSlotId = form.timeSlotId
    }
    if (form.reason.trim()) {
      payload.reason = form.reason.trim()
    }
    if (form.notes.trim()) {
      payload.notes = form.notes.trim()
    }

    const appointment = await createAppointment(payload)

    if (appointment) {
      setShowSuccess(true)
    }
  }

  function handleSuccessConfirm() {
    setShowSuccess(false)
    setForm(INITIAL_FORM)
    setErrors(INITIAL_ERRORS)
    clearTimeSlots()
  }

  function handleClearFields() {
    setForm(INITIAL_FORM)
    setErrors(INITIAL_ERRORS)
    clearTimeSlots()
  }

  // ─── Render ────────────────────────────────────────────────────────

  const showTimeSlotSelect = form.providerId && form.appointmentDate

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-navy">CREATE APPOINTMENT</h1>

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
          {/* Row 1: Patient + Provider */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Patient" required error={errors.userId}>
              <select
                value={form.userId}
                onChange={(e) => handleChange('userId', e.target.value)}
                className={inputClass(errors.userId)}
              >
                <option value="">Select patient</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Provider" required error={errors.providerId}>
              <select
                value={form.providerId}
                onChange={(e) => handleProviderChange(e.target.value)}
                className={inputClass(errors.providerId)}
              >
                <option value="">Select provider</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Row 2: Location + Date */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Location" required error={errors.locationId}>
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

            <FormField label="Appointment Date" required error={errors.appointmentDate}>
              <DatePicker
                selected={form.appointmentDate}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select date"
                className={inputClass(errors.appointmentDate)}
                wrapperClassName="w-full"
              />
            </FormField>
          </div>

          {/* Row 3: Time Slot + Appointment Time */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Time Slot">
              {showTimeSlotSelect ? (
                <div className="relative">
                  <select
                    value={form.timeSlotId}
                    onChange={(e) => handleTimeSlotChange(e.target.value)}
                    disabled={slotsLoading}
                    className={inputClass()}
                  >
                    <option value="">
                      {slotsLoading
                        ? 'Loading slots...'
                        : timeSlots.length === 0
                          ? 'No available slots'
                          : 'Select time slot'}
                    </option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.startTime} – {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <select disabled className={inputClass()}>
                  <option>Select provider & date first</option>
                </select>
              )}
            </FormField>

            <FormField label="Appointment Time" required error={errors.appointmentTime}>
              <input
                type="time"
                value={form.appointmentTime}
                onChange={(e) => handleChange('appointmentTime', e.target.value)}
                className={inputClass(errors.appointmentTime)}
              />
            </FormField>
          </div>

          {/* Row 4: Reason */}
          <div className="mt-4">
            <FormField label="Reason">
              <textarea
                value={form.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                placeholder="Routine checkup, follow-up visit..."
                rows={2}
                className={`${inputClass()} h-auto py-2`}
              />
            </FormField>
          </div>

          {/* Row 5: Notes */}
          <div className="mt-4">
            <FormField label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Patient requested morning appointment..."
                rows={2}
                className={`${inputClass()} h-auto py-2`}
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
              {isLoading ? 'Creating...' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <SuccessModal
          title="Appointment Created!"
          message="The new appointment has been created successfully."
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
