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

---

## 2026-02-19 — Admin Layout + Dashboard (sección 4.2)

### Decisiones de diseño

| Decisión | Opción elegida | Alternativa descartada |
|---|---|---|
| Color del sidebar | Navy sólido `#1C2A3A` (`bg-navy`) | Gradiente rojo `#E53935` → `#9E2A28` |
| Comportamiento al colapsar | Colapsar a iconos (~64px) | Ocultar completamente |
| Estado del sidebar | `useState` local en `AdminLayout` | React Context (innecesario, ningún otro componente lo necesita) |
| Dónde vive el AdminLayout | Dentro de `ProtectedRoute` envolviendo `<Outlet />` | Como layout route separado en el router |
| Dashboard como feature | `features/dashboard/` con hook, componentes y types | Solo una página sin feature folder |
| Logo en sidebar | Logo2.png (corazón) + texto blanco "DirectHealth" | Logo1.png (no funciona sobre fondo navy, el texto es navy) |

### Arquitectura del layout

```
┌──────────┬──────────────────────────┐
│          │  Header (nombre + avatar) │
│ Sidebar  ├──────────────────────────┤
│ (navy)   │                          │
│ 240px    │   Content (children)     │
│ ↔ 64px   │   bg-gray-50, scroll     │
│          │                          │
└──────────┴──────────────────────────┘

ProtectedRoute → AdminLayout → <Outlet />
                                  ↓
                           DashboardPage (u otra página protegida)
```

**¿Por qué `AdminLayout` envuelve `<Outlet />` dentro de `ProtectedRoute`?**
Todas las rutas protegidas comparten el mismo layout (sidebar + header). En lugar de envolver cada página individualmente, `ProtectedRoute` aplica el layout una sola vez. Esto simplifica la configuración del router y evita repetición.

### Conceptos nuevos de React usados

**`useEffect` para data fetching:**
A diferencia de `useSignIn` (que se dispara manualmente con un submit), `useDashboardStats` usa `useEffect` para hacer el fetch automáticamente cuando el componente se monta. El patrón `cancelled` flag previene race conditions si el componente se desmonta antes de que termine el fetch.

**`NavLink` de react-router-dom:**
Similar a `<Link>` pero con un callback `className={({ isActive }) => ...}` que permite aplicar estilos diferentes al item de navegación que corresponde a la ruta actual. Ideal para sidebars y navigation bars.

**Clase `group` de Tailwind:**
Permite que elementos hijos reaccionen al hover del padre. Se usa en `QuickAccessCard`: cuando el mouse pasa sobre la card, el icono cambia de color con `group-hover:bg-navy`.

### Feature: Dashboard (`src/features/dashboard/`)

| Archivo | Propósito |
|---|---|
| `types.ts` | Interface `DashboardStats` — mapea respuesta de `GET /api/admin/dashboard/stats` |
| `hooks/useDashboardStats.ts` | Hook con fetch automático al montar. Expone `{ stats, isLoading, error }` |
| `components/StatCard.tsx` | Card de estadística: icono en círculo coloreado, valor con `toLocaleString`, skeleton loader |
| `components/QuickAccessCard.tsx` | Card con `<Link>` a cada sección del admin, con hover effect |
| `index.ts` | Barrel export de la feature |

### Layout (`src/layouts/`)

| Archivo | Propósito |
|---|---|
| `Sidebar.tsx` | Sidebar navy colapsable (240px ↔ 64px). 8 NavLinks con active state. Logo2.png arriba, collapse toggle y Sign Out abajo |
| `AdminLayout.tsx` | Layout principal: sidebar + header (nombre admin + `IconUserCircle` avatar) + content area con scroll |

### Página

| Archivo | Propósito |
|---|---|
| `src/pages/DashboardPage.tsx` | 6 stat cards (Users, Providers, Appointments, Upcoming, Locations, Specialties) + 7 quick access cards |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/lib/api-endpoints.ts` | Agregado `DASHBOARD_ENDPOINTS.STATS` (`/admin/dashboard/stats`) |
| `src/routes/ProtectedRoute.tsx` | `<Outlet />` envuelto en `<AdminLayout>` |
| `src/routes/router.tsx` | Reemplazado `DashboardPlaceholder` por `DashboardPage`. Agregado index redirect `/admin` → `/admin/dashboard` |

### Archivos eliminados

| Archivo | Razón |
|---|---|
| `src/pages/DashboardPlaceholder.tsx` | Reemplazado por `DashboardPage`. Sign Out migrado al Sidebar |

### Estructura de rutas actualizada

| Ruta | Componente | Layout | Acceso |
|---|---|---|---|
| `/admin/login` | `LoginPage` | `AuthLayout` (centrado) | Público |
| `/admin` | Redirect → `/admin/dashboard` | — | — |
| `/admin/dashboard` | `DashboardPage` | `AdminLayout` (sidebar + header) | Protegido |
| `*` | Redirect → `/admin/login` | — | — |

### Endpoints de API utilizados

| Constante | Ruta | Método | Respuesta |
|---|---|---|---|
| `DASHBOARD_ENDPOINTS.STATS` | `/admin/dashboard/stats` | GET | `{ totalUsers, totalProviders, totalAppointments, appointmentsByStatus, totalLocations, totalSpecialties }` |

---

## 2026-02-19 — Refresh Token automático (complemento sección 4.1)

### Problema

El access token expira cada 15 minutos. Sin refresh automático, al expirar el token cualquier petición a la API fallaba con 401 y el usuario tenía que hacer login de nuevo manualmente.

### Solución implementada

Se agregó un **response interceptor** en `api-client.ts` que intercepta errores 401 y automáticamente refresca el token usando `POST /api/admin/auth/refresh`.

### Flujo del refresh automático

```
Petición normal → 401 Unauthorized
                      ↓
            ¿Es endpoint de auth? (/admin/auth/*)
            SÍ → No refrescar (evita loops). Lanzar ApiError
            NO ↓
            ¿Ya se reintentó esta petición? (_retry flag)
            SÍ → No refrescar. Lanzar ApiError
            NO ↓
            ¿Hay otro refresh en progreso?
            SÍ → Encolar petición en failedQueue. Esperar.
            NO ↓
            Llamar POST /admin/auth/refresh con refreshToken
                      ↓
            ¿Refresh exitoso?
            SÍ → Guardar nuevos tokens en localStorage
                 Procesar cola (reintentar peticiones encoladas)
                 Reintentar petición original con nuevo token
            NO → Limpiar localStorage (clearAuthStorage)
                 Procesar cola con error
                 Redirigir a /admin/login (full page reload)
```

### Conceptos nuevos usados

**Cola de peticiones (`failedQueue`):**
Cuando múltiples peticiones fallan con 401 al mismo tiempo (ej: el dashboard hace fetch de stats y otra sección pide datos simultáneamente), solo la PRIMERA dispara el refresh. Las demás se encolan como promesas pendientes. Cuando el refresh termina, todas las peticiones encoladas se reintentan automáticamente con el nuevo token. Esto evita hacer múltiples refreshes innecesarios.

**Flag `_retry` en la config de axios:**
Cada petición que se reintenta se marca con `_retry = true` en su config. Si el reintento también recibe 401 (no debería pasar, pero por seguridad), el interceptor no intenta refrescar de nuevo, evitando loops infinitos.

**`axios.post` directo vs `apiClient.post`:**
La llamada de refresh usa `axios.post` directamente (no `apiClient.post`) para evitar que los interceptors del `apiClient` interfieran. Si usáramos `apiClient.post`, el request interceptor agregaría el access token expirado, y el response interceptor podría intentar refrescar recursivamente si el refresh falla con 401.

**`window.location.href` para forzar logout:**
Cuando el refresh falla (refresh token también expirado), se usa `window.location.href = '/admin/login'` en vez de `navigate()` de React Router. Esto causa un **full page reload** que reinicia completamente el estado de React. Al recargar, `AuthProvider` lee de localStorage (ya limpio), `admin` es `null`, y la app muestra el login. No se puede usar `navigate()` porque `api-client.ts` es plain TypeScript fuera del árbol de React.

### Decisiones de diseño

| Decisión | Opción elegida | Alternativa descartada |
|---|---|---|
| Dónde vive la lógica de refresh | Response interceptor en `api-client.ts` | Hook `useRefreshToken` en React (no tendría acceso a todas las peticiones) |
| Cómo manejar múltiples 401 | Cola de promesas (`failedQueue`) | Dejar que cada petición haga su propio refresh (desperdicio, race conditions) |
| Cómo forzar logout al fallar | `window.location.href` (page reload) | Custom event + listener en AuthProvider (más complejo, mismo resultado) |
| Tipo de RefreshResponse | Interface local en `api-client.ts` | Importar `SignInResponse` de `features/auth` (crearía acoplamiento feature → lib) |
| Cómo evitar loops infinitos | Flag `_retry` + check `isAuthEndpoint` | WeakSet de configs reintentadas (no funciona porque axios crea nuevas configs) |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/lib/api-client.ts` | Response interceptor reescrito: ahora detecta 401, refresca token automáticamente, encola peticiones concurrentes, y fuerza logout si el refresh falla. Nuevos imports: `getRefreshToken`, `setRefreshToken`, `setStoredAdmin`, `clearAuthStorage` de storage.ts, `AUTH_ENDPOINTS` de api-endpoints.ts |

### Endpoints de API utilizados

| Constante | Ruta | Método | Body | Respuesta |
|---|---|---|---|---|
| `AUTH_ENDPOINTS.REFRESH` | `/admin/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken, admin }` |

---

## 2026-02-19 — Sub-menú colapsable en Sidebar

### Problema

El sidebar mostraba todos los items de navegación como links planos. Se necesitaba que "Users" tuviera sub-opciones ("View all users" y "Add new User") que se expandan/colapsen al hacer click.

### Solución implementada

Se añadió soporte para sub-menús en el Sidebar. Los items con `children` se comportan como botones que toggle su sub-menú, mientras los items sin `children` siguen siendo `NavLink` directos.

### Conceptos nuevos usados

**`useState` con lazy initializer:**
`useState(() => computeInitialValue())` ejecuta la función solo una vez en el primer render, no en cada re-render. Se usa para auto-expandir el sub-menú correcto basándose en la ruta actual (ej: si el usuario recarga la página estando en `/admin/users/new`, "Users" arranca expandido).

**`useLocation()` de react-router-dom:**
Permite acceder a `location.pathname` fuera de un `NavLink`. Se usa para determinar si un item padre está "activo" (la ruta actual coincide con su path o empieza con él).

**`aria-expanded`:**
Atributo ARIA que comunica a screen readers si un control expandible está abierto o cerrado. Se añade al botón del item padre.

**`NavLink` con prop `end`:**
Por defecto, `NavLink` marca como activo si la ruta actual *empieza* con su `to`. Con `end`, solo marca activo si es match *exacto*. Así "View all users" (`/admin/users`) no se marca activo cuando estamos en `/admin/users/new`.

**Type narrowing directo vs. variable intermedia:**
TypeScript no puede narrowear tipos a través de variables booleanas intermedias. `if (hasChildren)` no funciona para narrowear `item.children`, pero `if (item.children && item.children.length > 0)` sí, porque TypeScript analiza la condición directamente.

### Decisiones de diseño

| Decisión | Opción elegida | Alternativa descartada |
|---|---|---|
| Elemento del parent con children | `<button>` (toggle, no navega) | `<NavLink>` con `preventDefault` (semánticamente incorrecto) |
| Estado expandido | `expandedItem: string \| null` (un solo item a la vez) | `Set<string>` con múltiples expandidos (innecesario, UI más confusa) |
| Inicialización del expandido | Lazy initializer que busca match en ruta actual | Siempre `null` (malo: sub-menú cerrado al recargar página) |
| Sidebar colapsado + click en parent | Navega directo al path padre | No hacer nada (malo: item sin children no es clickeable) |
| Indicador visual de expansión | `IconChevronDown` / `IconChevronRight` | Rotar un solo icono con CSS (más complejo para el mismo resultado) |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/layouts/Sidebar.tsx` | Nuevos types `NavChild` y `NavItem` con campo `children` opcional. `expandedItem` state con auto-expand. `handleParentClick()` y `handleSimpleItemClick()`. Parents como `<button>` con chevron, children como `<NavLink end>`. Imports añadidos: `useState`, `ComponentType`, `useLocation`, `IconChevronDown`, `IconChevronRight` |

---

## 2026-02-19 — Users: API hook, tipos y lista paginada (sección 4.3)

### Arquitectura de la feature Users

```
src/
├── types/
│   └── api.ts                    ← NUEVO: PaginatedResponse<T> genérico
├── features/
│   └── users/
│       ├── types.ts              ← Gender type, User interface, UsersQueryParams
│       ├── utils.ts              ← formatDate(), formatGender()
│       ├── hooks/
│       │   └── useUsers.ts       ← Hook con fetch paginado + fetchUsers(params)
│       ├── components/
│       │   ├── UsersFilters.tsx   ← Gender select, Email Verified select, search, includeDeleted
│       │   ├── UsersTable.tsx     ← Tabla con 9 columnas, skeleton, filas clickeables
│       │   ├── UsersPagination.tsx← Page X of Y, total, botones prev/next
│       │   └── UserDetailModal.tsx← Popup con foto de perfil y detalles del usuario
│       └── index.ts              ← Barrel export
├── pages/
│   └── UsersPage.tsx             ← Compone filtros + tabla + paginación + modal
└── routes/
    └── router.tsx                ← Ruta /admin/users agregada
```

### Decisiones de diseño

| Decisión | Opción elegida | Alternativa descartada |
|---|---|---|
| Tipo paginado | `PaginatedResponse<T>` genérico en `src/types/api.ts` | Interface específica por feature (duplicación) |
| Gender type | `Gender` type separado de `User` (sin null para filtros) | `User['gender']` directo (incluye null, rompía `<select>`) |
| Debounce del search | `setTimeout` + `useRef` + cleanup en `useEffect` | Librería externa como lodash.debounce (innecesario para un caso) |
| Filtros | Controlled components (estado vive en `UsersPage`) | Uncontrolled con refs (el padre no tendría acceso a los valores) |
| Modal de detalle | Click en fila abre popup con `UserDetailModal` | Navegar a `/admin/users/:id` (el usuario prefirió popup) |
| Acciones Edit/Delete | `e.stopPropagation()` en los botones | Separar zona clickeable de la fila (más complejo, peor UX) |
| Count en tabla | Correlativo basado en página: `(page - 1) * limit + index + 1` | Usar `user.id` como contador (no es secuencial) |

### Conceptos nuevos usados

**`PaginatedResponse<T>` — Generics de TypeScript:**
Un generic permite definir un tipo "parametrizado". `PaginatedResponse<User>` dice "la respuesta paginada donde `data` es un `User[]`". Se reutilizará para providers, appointments, etc. sin duplicar la estructura `{ data, total, page, limit, totalPages }`.

**Debounce con `useRef` + `setTimeout`:**
El search box no hace un request por cada tecla. `setTimeout` programa la ejecución 300ms después. Si el usuario sigue escribiendo, `clearTimeout` cancela el timer anterior y crea uno nuevo. `useRef` guarda el timer ID entre renders sin causar re-renders (a diferencia de `useState`). El `useEffect` con cleanup asegura que el timer se cancele si el componente se desmonta.

**`e.stopPropagation()`:**
Los botones de Edit/Delete viven dentro de filas clickeables. Sin `stopPropagation()`, al hacer click en "Delete" también se dispararía el `onClick` de la fila (que abre el modal). `stopPropagation()` detiene la propagación del evento hacia arriba en el DOM.

**Controlled components:**
Los filtros (`<select>`, `<input>`) reciben su valor como prop (`value={gender}`) y notifican cambios vía callback (`onChange={onGenderChange}`). El estado "real" vive en `UsersPage`. Esto permite que el padre acceda a todos los valores de filtros para construir los query params del API call.

**Foco gestionado en modal:**
`UserDetailModal` usa `useRef` para referenciar el botón de cerrar y `useEffect` para llamar `.focus()` al montar. Sin esto, el foco quedaría detrás del overlay y usuarios de teclado no sabrían que hay un modal abierto.

**`timeZone: 'UTC'` en `toLocaleDateString`:**
Sin esto, "1992-07-08" podría mostrarse como "Jul 7, 1992" en timezones negativos. El navegador interpreta la fecha como midnight UTC y al restar horas por el timezone local, retrocede un día.

### Bug corregido: `gender: null` del backend

La API devuelve `gender: null` para usuarios que no han configurado su género. El tipo `User` original definía `gender` como union de strings sin null. Esto causaba `Cannot read properties of null (reading 'replace')` en `formatGender()`.

**Fix:** Se extrajo `Gender` como type separado con los 5 valores válidos. `User.gender` es `Gender | null`, mientras `UsersQueryParams.gender` y los filtros usan `Gender` sin null (no tiene sentido filtrar por null). `formatGender()` ahora devuelve `"—"` si recibe null.

### Tipo compartido

| Archivo | Tipo | Propósito |
|---|---|---|
| `src/types/api.ts` | `PaginatedResponse<T>` | Respuesta paginada genérica. Se reutilizará en todas las features con listados |

### Feature: Users (`src/features/users/`)

| Archivo | Propósito |
|---|---|
| `types.ts` | `Gender` type (5 valores), `User` interface (12 campos + null handling), `UsersQueryParams` (6 params opcionales) |
| `utils.ts` | `formatDate()` — ISO → "Jul 8, 1992" con UTC. `formatGender()` — snake_case → "Capitalizado", null → "—" |
| `hooks/useUsers.ts` | Hook con fetch automático al montar + `fetchUsers(params?)` para re-fetch. `useCallback` para referencia estable |
| `components/UsersFilters.tsx` | 4 filtros controlled: Gender select, Email Verified select, Include Deleted checkbox, Search input con icono |
| `components/UsersTable.tsx` | Tabla 9 columnas: #, nombre, email, DOB, gender, verified (badge verde/rojo), edit + delete icons. Skeleton loader |
| `components/UsersPagination.tsx` | "X total users" + "Page X of Y" + botones prev/next con disabled states |
| `components/UserDetailModal.tsx` | Popup: foto de perfil (o placeholder), nombre, email, DOB, gender, verified, created, deleted. Cierra con Escape/overlay/botón X |
| `index.ts` | Barrel export: `useUsers`, `User`, `Gender`, `UsersQueryParams` |

### Página

| Archivo | Propósito |
|---|---|
| `src/pages/UsersPage.tsx` | Compone todos los componentes. Título "USERS", filtros, tabla, paginación, modal. Debounce 300ms en search. `handleEdit` y `handleDelete` como placeholder para implementación futura |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/lib/api-endpoints.ts` | Agregado `USER_ENDPOINTS.LIST` (`/admin/users`) |
| `src/routes/router.tsx` | Agregada ruta `users` → `UsersPage` dentro de rutas protegidas |

### Estructura de rutas actualizada

| Ruta | Componente | Layout | Acceso |
|---|---|---|---|
| `/admin/login` | `LoginPage` | `AuthLayout` (centrado) | Público |
| `/admin` | Redirect → `/admin/dashboard` | — | — |
| `/admin/dashboard` | `DashboardPage` | `AdminLayout` (sidebar + header) | Protegido |
| `/admin/users` | `UsersPage` | `AdminLayout` (sidebar + header) | Protegido |
| `*` | Redirect → `/admin/login` | — | — |

### Endpoints de API utilizados

| Constante | Ruta | Método | Query Params | Respuesta |
|---|---|---|---|---|
| `USER_ENDPOINTS.LIST` | `/admin/users` | GET | `page`, `limit`, `search`, `gender`, `isEmailVerified`, `includeDeleted` | `PaginatedResponse<User>` |
