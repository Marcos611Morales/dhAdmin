# DHDocumentationSuperAdmin.md

Registro de cambios y decisiones técnicas del Super Admin Panel de DirectHealth.

---

## 2026-02-19 — Configuración inicial del Design System

### Paquetes instalados

| Paquete | Versión | Razón |
|---------|---------|-------|
| `tailwindcss` | 4.2.0 | Framework de estilos CSS utility-first (v4, CSS-first config) |
| `@tailwindcss/vite` | 4.2.0 | Plugin de Vite para Tailwind v4 (reemplaza PostCSS + autoprefixer) |

### Configuración realizada

1. **Tailwind CSS v4** configurado con plugin de Vite (`@tailwindcss/vite`). No se necesita `tailwind.config.js`, `postcss.config.js` ni `autoprefixer`.

2. **Path alias `@/`** configurado en `vite.config.ts` y `tsconfig.app.json`. Permite imports como `import { App } from '@/App'` en vez de rutas relativas.

3. **Fuente Inter** cargada vía Google Fonts CDN en `index.html` con pesos 400, 500, 600 y 700. Configurada como `--font-sans` en Tailwind.

4. **Design tokens** definidos en `src/index.css` usando `@theme {}` de Tailwind v4:
   - Colores brand (rojo, rojo oscuro, navy)
   - Colores semánticos (link, notificaciones, iconos)
   - Colores de badges para estados (upcoming, cancelled, available, booked)
   - Colores de iconos de notificación (6 tipos)
   - Sombras (card, modal)

5. **Logos** copiados de `ClaudeHelp/Images/` a `src/assets/` (para imports en componentes) y `public/` (para favicon).

6. **Boilerplate eliminado:** `App.css`, `vite.svg`, `react.svg`.

### Mapeo Design System → Tailwind Utilities

#### Colores (referencia rápida)

| Uso en Design System | Hex | Utility Tailwind |
|---|---|---|
| Brand red | `#E53935` | `text-brand-red` / `bg-brand-red` |
| Brand red dark (gradient) | `#9E2A28` | `text-brand-red-dark` / `bg-brand-red-dark` |
| Primary text / button | `#1C2A3A` | `text-navy` / `bg-navy` |
| Secondary text | `#6B7580` | `text-gray-500` |
| Placeholder / disabled | `#9CA3AF` | `text-gray-400` |
| Input bg | `#F9FAFB` | `bg-gray-50` |
| Light gray bg | `#F3F4F6` | `bg-gray-100` |
| Gray button bg | `#E5E7EB` | `bg-gray-200` |
| Border default | `#D1D5DB` | `border-gray-300` |
| Border light / divider | `#E5E7EB` | `border-gray-200` |
| Border focus | `#1C2A3A` | `focus:border-navy` |
| Link blue | `#1877F2` | `text-link` |
| Success green | `#10B981` | `text-emerald-500` |
| Sidebar gradient | `#E53935` → `#9E2A28` | `bg-gradient-to-b from-brand-red to-brand-red-dark` |
| Card shadow | custom | `shadow-card` |
| Modal shadow | custom | `shadow-modal` |

#### Badges

| Estado | Clase fondo | Clase texto |
|---|---|---|
| upcoming | `bg-badge-upcoming-bg` | `text-badge-upcoming-text` |
| cancelled / unavailable | `bg-badge-cancelled-bg` | `text-badge-cancelled-text` |
| available / active | `bg-badge-available-bg` | `text-badge-available-text` |
| booked | `bg-badge-booked-bg` | `text-badge-booked-text` |
| past / inactive / blocked | `bg-gray-100` | `text-gray-500` |

#### Tipografía

| Nivel | Tailwind Utility |
|---|---|
| H1 (24px bold) | `text-2xl font-bold` |
| H2 (20px bold) | `text-xl font-bold` |
| H3 (18px semibold) | `text-lg font-semibold` |
| Body Large (16px medium) | `text-base font-medium` |
| Body (14px regular) | `text-sm` |
| Caption (12px regular) | `text-xs` |

### Archivos modificados

| Archivo | Acción |
|---|---|
| `package.json` | Agregadas dependencias tailwindcss y @tailwindcss/vite |
| `vite.config.ts` | Plugin Tailwind + path alias `@/` |
| `tsconfig.app.json` | Path alias `@/` (baseUrl + paths) |
| `src/index.css` | Reemplazado boilerplate con Design System (Tailwind v4 @theme) |
| `index.html` | Inter font CDN, favicon Logo2.png, título "DirectHealth Admin" |
| `src/main.tsx` | Import actualizado con `@/` alias y named import |
| `src/App.tsx` | Placeholder de verificación del Design System |
| `src/assets/Logo1.png` | Logo completo (copiado de ClaudeHelp/Images/) |
| `src/assets/Logo2.png` | Logo icono (copiado de ClaudeHelp/Images/) |
| `public/Logo2.png` | Favicon (copiado de ClaudeHelp/Images/) |
| `src/App.css` | Eliminado (boilerplate) |
| `public/vite.svg` | Eliminado (boilerplate) |
| `src/assets/react.svg` | Eliminado (boilerplate) |

---

## 2026-02-19 — Configuración de URLs de API

### Archivo creado: `src/lib/config.ts`

Archivo centralizado para manejar las URLs base de la API según el entorno:

- **Development:** `http://localhost:3000` (se usa automáticamente con `pnpm dev`)
- **Production:** Pendiente de definir (placeholder `aqui_debe_de_ir_la_url_a_produccion`)

Usa `import.meta.env.DEV` de Vite para detectar el entorno automáticamente. No se necesitan archivos `.env`.

**Uso en el proyecto:**
```ts
import { API_BASE_URL } from '@/lib/config'
```

| Archivo | Acción |
|---|---|
| `src/lib/config.ts` | Creado — URLs de API por entorno |

---

## 2026-02-19 — Cliente HTTP (axios) y manejo de errores

### Paquetes instalados

| Paquete | Versión | Razón |
|---------|---------|-------|
| `axios` | 1.13.5 | Cliente HTTP con interceptors para manejo centralizado de auth y errores |

### Archivos creados

#### `src/lib/api-error.ts`

Manejo tipado de errores del backend:

- **`HTTP_STATUS`** — Constantes `as const` con los códigos HTTP que devuelve el backend (400, 401, 404, 409, 422, 500)
- **`ApiError`** — Clase que extiende `Error` con `statusCode` y `errors` (array de mensajes). Parsea el formato default de NestJS: `{ statusCode, message, error }`
- **`isApiError()`** — Type guard para usar en bloques `catch` con tipo `unknown`

#### `src/lib/api-client.ts`

Instancia de axios preconfigurada:

- **baseURL:** `${API_BASE_URL}/api` (lee de `config.ts`)
- **Content-Type:** `application/json` por defecto
- **Interceptor de respuesta:** Transforma errores HTTP en `ApiError` tipados. Errores de red (sin respuesta del servidor) se convierten en `ApiError` con `statusCode: 0`

**Uso:**
```ts
import { apiClient } from '@/lib/api-client'
import { isApiError, HTTP_STATUS } from '@/lib/api-error'

// GET request tipado
const { data } = await apiClient.get<User[]>('/admin/users')

// Manejo de errores
try {
  await apiClient.post('/admin/auth/sign-in', body)
} catch (error) {
  if (isApiError(error)) {
    if (error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      // Credenciales inválidas
    }
  }
}
```

| Archivo | Acción |
|---|---|
| `package.json` | Agregada dependencia `axios` |
| `src/lib/api-error.ts` | Creado — Tipos de error NestJS, clase ApiError, HTTP status codes |
| `src/lib/api-client.ts` | Creado — Instancia axios con baseURL e interceptor de errores |

---

## 2026-02-19 — Registro de endpoints de API

### Archivo creado: `src/lib/api-endpoints.ts`

Archivo centralizado con las rutas de todos los endpoints del backend como constantes `as const`. Las rutas son relativas a la baseURL del `apiClient` (no incluyen `/api`).

**Endpoints incluidos (Auth Admin — sección 4.1):**

| Constante | Ruta | Método HTTP |
|---|---|---|
| `AUTH_ENDPOINTS.SIGN_IN` | `/admin/auth/sign-in` | POST |
| `AUTH_ENDPOINTS.SIGN_OUT` | `/admin/auth/sign-out` | POST |
| `AUTH_ENDPOINTS.REFRESH` | `/admin/auth/refresh` | POST |

| Archivo | Acción |
|---|---|
| `src/lib/api-endpoints.ts` | Creado — Constantes de endpoints de Auth Admin |

---

## 2026-02-19 — Login Page + Sistema de Autenticación

### Paquetes instalados

| Paquete | Versión | Razón |
|---------|---------|-------|
| `react-router-dom` | 7.13.0 | Client-side routing (login vs rutas protegidas) |
| `@tabler/icons-react` | 3.36.1 | Librería de iconos del proyecto (IconEye/IconEyeOff para toggle password) |

### Arquitectura implementada

```
Flujo de autenticación:

1. Usuario abre la app → router redirige a /admin/login
2. LoginForm llama POST /api/admin/auth/sign-in vía useSignIn hook
3. Respuesta exitosa → AuthContext guarda tokens + admin en localStorage
4. Router detecta admin !== null → permite acceso a rutas protegidas
5. Request interceptor en api-client.ts adjunta JWT automáticamente

localStorage ←→ AuthContext (React state)
     ↑                    ↑
     |                    |
api-client.ts        Componentes React
(lee token)       (leen admin, signIn, signOut)
```

**¿Por qué localStorage y no Context para el interceptor?**
El interceptor de axios es plain TypeScript fuera del árbol de React — no puede usar hooks. Lee el token directamente de localStorage. El AuthContext escribe a localStorage y actualiza React state simultáneamente, manteniendo ambos sincronizados.

### Archivos creados

#### Feature: Auth (`src/features/auth/`)

| Archivo | Propósito |
|---|---|
| `types.ts` | Interfaces: `AdminUser`, `SignInRequest`, `SignInResponse`, `AuthContextValue` |
| `context/auth-context.ts` | `createContext<AuthContextValue>` (separado del Provider por regla ESLint react-refresh) |
| `context/AuthContext.tsx` | `AuthProvider` — React Context Provider que sincroniza state + localStorage |
| `hooks/useAuth.ts` | Hook `useAuth()` — consume el AuthContext |
| `hooks/useSignIn.ts` | Hook `useSignIn()` — llamada API con `isLoading`, `error`, `signIn()` |
| `components/LoginForm.tsx` | Formulario: email, password (con toggle show/hide), botón submit, error display |
| `index.ts` | Barrel export de la feature |

#### Infraestructura

| Archivo | Propósito |
|---|---|
| `src/lib/storage.ts` | Helpers tipados para localStorage (tokens + admin data). Keys con prefijo `dh_` |
| `src/layouts/AuthLayout.tsx` | Layout centrado con card blanca y Logo1.png (logo con nombre) |
| `src/pages/LoginPage.tsx` | Página de login. Redirige a dashboard si ya está autenticado |
| `src/pages/DashboardPlaceholder.tsx` | Placeholder temporal post-login con botón Sign Out |
| `src/routes/ProtectedRoute.tsx` | Guard: redirige a login si `admin` es null, renderiza `<Outlet />` si autenticado |
| `src/routes/router.tsx` | Configuración de rutas con `createBrowserRouter` |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/lib/api-client.ts` | Agregado request interceptor que adjunta `Authorization: Bearer` desde localStorage |
| `src/main.tsx` | Reemplazado `<App />` con `<AuthProvider>` + `<RouterProvider>` |
| `package.json` | Agregadas dependencias `react-router-dom` y `@tabler/icons-react` |

### Archivos eliminados

| Archivo | Razón |
|---|---|
| `src/App.tsx` | Reemplazado por el sistema de rutas. El router maneja todo el rendering |

### Estructura de rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/admin/login` | `LoginPage` | Público |
| `/admin/dashboard` | `DashboardPlaceholder` | Protegido (requiere auth) |
| `*` | Redirect → `/admin/login` | — |

### Nota sobre ESLint react-refresh

El plugin `react-refresh/only-export-components` requiere que los archivos `.tsx` exporten solo componentes React. Por eso:
- El `createContext()` vive en `auth-context.ts` (archivo .ts, no .tsx)
- El `AuthProvider` componente vive en `AuthContext.tsx`
- El hook `useAuth` vive en `hooks/useAuth.ts`
