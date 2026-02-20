import type { ProviderGender } from '@/features/providers/types'

/**
 * Map de gender interno → label legible.
 *
 * Se usa un objeto en vez de un switch para que agregar nuevos valores
 * sea simplemente agregar una línea, sin tocar la estructura.
 */
const GENDER_LABELS: Record<ProviderGender, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non binary',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
}

/**
 * Formatea el gender de un provider para mostrar en la tabla.
 * Si es null (no especificado), retorna '—' como placeholder visual.
 */
export function formatProviderGender(gender: ProviderGender | null): string {
  if (!gender) return '—'
  return GENDER_LABELS[gender] ?? gender
}

/**
 * Formatea un precio numérico a formato moneda USD.
 * `80` → `$80.00`, `null` → `'—'`
 *
 * `toFixed(2)` asegura siempre 2 decimales.
 */
export function formatPrice(price: number | string | null): string {
  if (price === null) return '—'
  const numeric = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numeric)) return '—'
  return `$${numeric.toFixed(2)}`
}

/**
 * Construye el nombre completo de un provider.
 * Concatena title (si existe) + firstName + lastName.
 *
 * Ejemplo: "Dr." + "Sam" + "Peterson" → "Dr. Sam Peterson"
 * Si title es null: "Sam Peterson"
 */
export function buildProviderName(
  title: string | null,
  firstName: string,
  lastName: string,
): string {
  const parts: string[] = []
  if (title) parts.push(title)
  parts.push(firstName)
  parts.push(lastName)
  return parts.join(' ')
}
