import { useState } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useSignIn } from '@/features/auth/hooks/useSignIn'
import type { SignInResponse } from '@/features/auth/types'

interface LoginFormProps {
  onSuccess: (response: SignInResponse) => void
}

/**
 * Formulario de login con email y password.
 *
 * No maneja navegación ni almacenamiento de tokens — solo la UI y la llamada API.
 * El componente padre (LoginPage) decide qué hacer cuando el login es exitoso
 * a través del callback `onSuccess`.
 *
 * Accesibilidad:
 * - `<form>` semántico con `noValidate` (validación propia, no del navegador)
 * - `<label htmlFor>` en cada input
 * - `autoComplete` para que el navegador sugiera credenciales guardadas
 * - `role="alert"` en el error para que lectores de pantalla lo anuncien
 * - `aria-label` en el botón de toggle password
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, isLoading, error } = useSignIn()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const response = await signIn({ email, password })
      onSuccess(response)
    } catch {
      // El error ya se muestra vía el estado `error` del hook useSignIn
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@directhealth.com"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-navy placeholder:text-gray-400 focus:border-navy focus:outline-none"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-11 text-sm text-navy placeholder:text-gray-400 focus:border-navy focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-500"
          >
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p role="alert" className="text-sm text-brand-red">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full rounded-lg bg-navy text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
