/**
 * Códigos HTTP que devuelve el backend NestJS.
 * Usar con `as const` en vez de enum (convención del proyecto).
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

/**
 * Forma del error que devuelve NestJS por defecto.
 *
 * Ejemplo real del backend:
 * {
 *   "statusCode": 401,
 *   "message": "Invalid email or password",
 *   "error": "Unauthorized"
 * }
 *
 * Cuando hay errores de validación (class-validator), `message` es un array:
 * {
 *   "statusCode": 400,
 *   "message": ["email must be valid", "password is required"],
 *   "error": "Bad Request"
 * }
 */
interface NestErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

/**
 * Error tipado para respuestas HTTP del backend.
 *
 * Extiende Error nativo para que funcione con try/catch.
 * `statusCode` permite diferenciar el tipo de error (401 vs 404 vs 400, etc.)
 * `errors` siempre es un array para manejar tanto errores simples como de validación.
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly errors: string[]

  constructor(response: NestErrorResponse) {
    const messages = Array.isArray(response.message)
      ? response.message
      : [response.message]

    super(messages[0])
    this.name = 'ApiError'
    this.statusCode = response.statusCode
    this.errors = messages
  }
}

/**
 * Type guard para verificar si un error desconocido es un ApiError.
 *
 * Útil en bloques catch donde el tipo es `unknown`:
 * ```ts
 * try { ... } catch (error) {
 *   if (isApiError(error)) {
 *     // TypeScript sabe que error.statusCode existe
 *   }
 * }
 * ```
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
