import type { AdminUser } from '@/features/auth/types'

/**
 * Keys de localStorage con prefijo `dh_` para evitar colisiones
 * con otras apps en el mismo dominio (ej. localhost).
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dh_access_token',
  REFRESH_TOKEN: 'dh_refresh_token',
  ADMIN: 'dh_admin',
} as const

// ─── Access Token ───

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
}

export function setAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
}

// ─── Refresh Token ───

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
}

// ─── Admin Data ───

/**
 * Lee los datos del admin de localStorage.
 * Retorna null si no hay datos o si el JSON está corrupto (en vez de crashear la app).
 */
export function getStoredAdmin(): AdminUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ADMIN)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function setStoredAdmin(admin: AdminUser): void {
  localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin))
}

// ─── Clear All ───

export function clearAuthStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.ADMIN)
}
