import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { IconLoader2 } from '@tabler/icons-react'
import { useCreateUser } from '@/features/users/hooks/useCreateUser'
import { SuccessModal } from '@/components/ui/SuccessModal'
import type { Gender, CreateUserPayload } from '@/features/users/types'

/**
 * Opciones del select de gender.
 * Separado del componente para que React no re-cree el array en cada render.
 */
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

/**
 * Genera un password aleatorio de 10 caracteres.
 *
 * Garantiza al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.
 * Los 6 caracteres restantes se eligen aleatoriamente del pool completo.
 * Al final se mezcla el array con Fisher-Yates shuffle para que los caracteres
 * garantizados no queden siempre al inicio.
 *
 * `crypto.getRandomValues` es más seguro que `Math.random()` porque usa
 * el generador criptográfico del navegador (no predecible).
 */
function generatePassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const special = '!@#$%&*?'
  const all = upper + lower + digits + special

  function randomChar(chars: string): string {
    const randomValues = new Uint32Array(1)
    crypto.getRandomValues(randomValues)
    return chars[randomValues[0] % chars.length]
  }

  // Garantizar al menos 1 de cada tipo
  const chars = [
    randomChar(upper),
    randomChar(lower),
    randomChar(digits),
    randomChar(special),
  ]

  // Rellenar los 8 restantes con caracteres aleatorios del pool completo
  for (let i = 0; i < 8; i++) {
    chars.push(randomChar(all))
  }

  // Fisher-Yates shuffle para que el orden sea aleatorio
  for (let i = chars.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1)
    crypto.getRandomValues(randomValues)
    const j = randomValues[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

/**
 * Formatea un objeto Date a string "YYYY-MM-DD" para el backend.
 *
 * Se usa `getFullYear`, `getMonth`, `getDate` (métodos locales, no UTC)
 * porque el DatePicker devuelve un Date basado en el timezone local.
 * Si usáramos `toISOString().slice(0, 10)`, podría retroceder un día
 * en timezones negativos (UTC-5, etc.) porque toISOString convierte a UTC.
 *
 * `padStart(2, '0')` asegura que el mes y día tengan 2 dígitos: "07" en vez de "7".
 */
function formatDateForApi(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Interfaz del estado del formulario.
 *
 * Todos los campos son strings (excepto dateOfBirth que es Date | null)
 * porque los inputs de HTML siempre trabajan con strings. La conversión
 * al tipo correcto (Gender, boolean, etc.) se hace al construir el
 * payload antes del submit.
 *
 * `dateOfBirth` es `Date | null` porque react-datepicker trabaja con
 * objetos Date, no strings. `null` significa "no seleccionado".
 */
interface FormState {
  firstName: string
  middleName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: Date | null
  gender: Gender | ''
  profileImageUrl: string
}

/**
 * Genera el estado inicial del formulario.
 *
 * Es una función (no una constante) porque necesita generar un password
 * aleatorio distinto cada vez que se usa. Si fuera `const`, el password
 * se generaría una sola vez al cargar el módulo y sería siempre el mismo.
 */
function createInitialForm(): FormState {
  const suggestedPassword = generatePassword()
  return {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: suggestedPassword,
    confirmPassword: suggestedPassword,
    dateOfBirth: null,
    gender: '',
    profileImageUrl: '',
  }
}

/** Constante para resetear con Clear Fields (campos vacíos, sin password) */
const EMPTY_FORM: FormState = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: null,
  gender: '',
  profileImageUrl: '',
}

/**
 * Errores de validación del formulario.
 *
 * Cada campo tiene un string de error o string vacío.
 * String vacío = sin error. Esto simplifica la validación:
 * `if (errors.firstName)` es true cuando hay error.
 */
interface FormErrors {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

const INITIAL_ERRORS: FormErrors = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

/**
 * Página "Add new User" — formulario para crear un usuario.
 *
 * **Patrón de formulario controlado:**
 * Todos los inputs están "controlados" — su valor viene del estado de React
 * (`form.firstName`, `form.email`, etc.) y se actualiza con `handleChange`.
 * Esto permite:
 * 1. Validar en tiempo real antes del submit
 * 2. Resetear todos los campos de golpe (`setForm(INITIAL_FORM)`)
 * 3. Construir el payload exacto que necesita la API
 *
 * **Validación en dos niveles:**
 * 1. **Client-side (antes del submit):** campos vacíos, formato de email,
 *    longitud de password, coincidencia de passwords. Esto da feedback
 *    instantáneo sin gastar un request a la API.
 * 2. **Server-side (después del submit):** email duplicado (409), errores
 *    de validación del backend (400). Estos aparecen en el error banner.
 *
 * **`handleChange` con genéricos:**
 * En vez de tener un handler para cada input (handleFirstNameChange,
 * handleEmailChange...), usamos un solo handler que recibe el nombre
 * del campo como parámetro. Esto funciona gracias a "computed property
 * names" de JavaScript: `{ [field]: value }` crea un objeto con la key
 * dinámica. TypeScript garantiza que `field` sea una key válida de FormState.
 */
export function CreateUserPage() {
  const [form, setForm] = useState<FormState>(createInitialForm)
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS)
  const [showSuccess, setShowSuccess] = useState(false)

  const { isLoading, error: apiError, fieldErrors, createUser } = useCreateUser()

  // ─── Handlers ──────────────────────────────────────────────────────

  /**
   * Handler genérico para inputs de texto.
   *
   * `keyof FormState` es un "union type" que TypeScript genera a partir
   * de las keys de la interfaz: 'firstName' | 'middleName' | 'lastName' | ...
   *
   * Al pasar por ej. 'firstName', TypeScript verifica que es una key válida.
   * Si escribieras handleChange('firstNam', ...) — con typo — TypeScript
   * daría un error de compilación. Esto previene bugs por typos.
   *
   * El `[field]: value` es "computed property name" de ES6: crea un objeto
   * donde la key es el VALOR de la variable `field`, no el string literal "field".
   *
   * Ejemplo: handleChange('email', 'john@test.com')
   * → setForm(prev => ({ ...prev, email: 'john@test.com' }))
   */
  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))

    // Limpia el error del campo al escribir (solo si tenía error)
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  function handleDateChange(date: Date | null) {
    setForm((prev) => ({ ...prev, dateOfBirth: date }))
  }

  function handleGenderChange(value: string) {
    setForm((prev) => ({ ...prev, gender: value as Gender | '' }))
  }

  // ─── Validación ────────────────────────────────────────────────────

  /**
   * Valida todos los campos requeridos antes del submit.
   *
   * Retorna `true` si todo está bien, `false` si hay errores.
   * Los errores se guardan en el estado para mostrar mensajes
   * debajo de cada campo.
   *
   * Patrón EMAIL_REGEX:
   * - `[^\s@]+` → uno o más chars que no sean espacio ni @
   * - `@[^\s@]+` → arroba seguida de uno o más chars
   * - `\.[^\s@]+` → punto seguido de uno o más chars
   * Esto valida la forma básica (algo@algo.algo) sin ser excesivamente
   * estricto — la validación definitiva la hace el backend.
   */
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

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
      isValid = false
    } else {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!EMAIL_REGEX.test(form.email.trim())) {
        newErrors.email = 'Please enter a valid email address'
        isValid = false
      }
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password'
      isValid = false
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // ─── Submit ────────────────────────────────────────────────────────

  /**
   * `handleSubmit` es async porque `createUser` retorna una Promise.
   *
   * `e.preventDefault()` evita que el browser haga un "form submit"
   * tradicional (que recargaría la página). En React, siempre manejamos
   * el submit manualmente para tener control total sobre el proceso.
   *
   * Flujo:
   * 1. Previene submit nativo del browser
   * 2. Valida client-side → si falla, no hace request
   * 3. Construye el payload (solo campos con valor)
   * 4. Llama al hook createUser → hace POST a la API
   * 5. Si éxito → muestra modal + limpia form
   * 6. Si falla → el hook guarda el error en su state, se muestra en banner
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const payload: CreateUserPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      isEmailVerified: false,
    }

    // Solo incluir campos opcionales si tienen valor
    if (form.middleName.trim()) {
      payload.middleName = form.middleName.trim()
    }
    if (form.dateOfBirth) {
      payload.dateOfBirth = formatDateForApi(form.dateOfBirth)
    }
    if (form.gender) {
      payload.gender = form.gender
    }
    if (form.profileImageUrl.trim()) {
      payload.profileImageUrl = form.profileImageUrl.trim()
    }

    const user = await createUser(payload)

    if (user) {
      setShowSuccess(true)
    }
  }

  function handleSuccessConfirm() {
    setShowSuccess(false)
    setForm(createInitialForm())
    setErrors(INITIAL_ERRORS)
  }

  function handleClearFields() {
    setForm(EMPTY_FORM)
    setErrors(INITIAL_ERRORS)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-navy">ADD NEW USER</h1>

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
          {/* Row 1: First Name + Middle Name + Last Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              label="First Name"
              required
              error={errors.firstName}
            >
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                maxLength={50}
                className={inputClass(errors.firstName)}
              />
            </FormField>

            <FormField label="Middle Name">
              <input
                type="text"
                value={form.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
                placeholder="Michael"
                maxLength={50}
                className={inputClass()}
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
                placeholder="Doe"
                maxLength={50}
                className={inputClass(errors.lastName)}
              />
            </FormField>
          </div>

          {/* Row 2: Email */}
          <div className="mt-4">
            <FormField
              label="Email"
              required
              error={errors.email}
            >
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                className={inputClass(errors.email)}
              />
            </FormField>
          </div>

          {/* Row 3: Password + Confirm Password (visible para que el admin copie) */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Password"
              required
              error={errors.password}
            >
              <input
                type="text"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min. 8 characters"
                autoComplete="off"
                className={inputClass(errors.password)}
              />
            </FormField>

            <FormField
              label="Confirm Password"
              required
              error={errors.confirmPassword}
            >
              <input
                type="text"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                autoComplete="off"
                className={inputClass(errors.confirmPassword)}
              />
            </FormField>
          </div>

          {/* Row 4: Date of Birth + Gender */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Date of Birth">
              <DatePicker
                selected={form.dateOfBirth}
                onChange={handleDateChange}
                maxDate={new Date()}
                dateFormat="MMM d, yyyy"
                placeholderText="Select date of birth"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                className={inputClass()}
                wrapperClassName="w-full"
              />
            </FormField>

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
          </div>

          {/* Row 5: Image URL */}
          <div className="mt-4">
            <FormField label="Image URL">
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
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <SuccessModal
          title="User Created!"
          message="The new user has been created successfully."
          onConfirm={handleSuccessConfirm}
        />
      )}
    </div>
  )
}

// ─── Sub-componentes internos ──────────────────────────────────────────

/**
 * Genera las clases CSS para un input, adaptando el borde según si hay error.
 *
 * Es una función (no un componente) porque solo genera un string de clases.
 * Los inputs son distintos (input, select, DatePicker) así que no podemos
 * abstraerlos a un solo componente, pero sí compartir las clases de estilos.
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
 *
 * Incluye: label, indicador de requerido (*), el input (como children),
 * y el mensaje de error si existe.
 *
 * Se usa el patrón "children" para que este wrapper funcione con cualquier
 * tipo de input (text, email, select, DatePicker, etc.) sin tener que
 * crear un prop por cada variante.
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
