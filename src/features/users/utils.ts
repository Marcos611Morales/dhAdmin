/**
 * Formatea una fecha ISO ("1992-07-08" o "2025-10-01T14:30:00.000Z")
 * a formato legible: "Jul 8, 1992".
 *
 * Usa `toLocaleDateString('en-US')` que formatea según el locale inglés.
 * Las opciones `month: 'short'` producen abreviatura de 3 letras (Jan, Feb, Mar...),
 * `day: 'numeric'` sin cero inicial, `year: 'numeric'` con 4 dígitos.
 *
 * Se añade `timeZone: 'UTC'` para evitar que el navegador ajuste la fecha
 * al timezone local. Sin esto, "1992-07-08" podría mostrarse como "Jul 7, 1992"
 * en timezones negativos (el navegador interpreta la fecha como midnight UTC
 * y al restar horas, retrocede un día).
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Formatea el valor de gender del backend a texto legible.
 *
 * "non_binary"       → "Non binary"
 * "prefer_not_to_say" → "Prefer not to say"
 * "male"             → "Male"
 *
 * Reemplaza underscores por espacios y capitaliza la primera letra.
 */
export function formatGender(gender: string | null): string {
  if (!gender) return '—'
  const withSpaces = gender.replace(/_/g, ' ')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}
