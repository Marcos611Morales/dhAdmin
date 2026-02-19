# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Direct Healthcare Super Admin Panel** — a web admin panel for managing all data in the DirectHealth system (users, providers, appointments, locations, specialties, FAQs, contact submissions). This is NOT accessible to regular app users. The mobile app (SwiftUI) and backend (NestJS) live in separate repos.

## Development Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Start Vite dev server with HMR
pnpm build        # TypeScript check + Vite production build (tsc -b && vite build)
pnpm lint         # ESLint across the project
pnpm preview      # Preview production build locally
```

**Always use pnpm.** Never npm or yarn. Use `pnpm add` to install new packages, `pnpm dlx` instead of `npx`.

## Documentation References

Read these files for full project context:
- `ClaudeHelp/SuperAdminContext.md` — Complete spec: screens, API endpoints, design system, DB schema
- `ClaudeHelp/CreacionBaseDeDatos.md` — PostgreSQL schema, ER diagram, SQL migrations
- `ClaudeHelp/DHDocumentation.md` — Existing REST API endpoints (user-facing)

## Architecture

**Stack:** React 19 + Vite 7 + TypeScript (strict) + Tailwind CSS

**Backend API:** REST at `http://localhost:3000/api`. Admin endpoints under `/api/admin/*` use JWT auth (`Authorization: Bearer <token>`). Admin tokens use separate JWT secrets from user tokens.

**Auth flow:** Email/password sign-in (no OTP) → accessToken (15min) + refreshToken (7 days). Tokens belong to `super_admins` table (separate from `users`).

**Paginated list pattern:** All list endpoints accept `?page=1&limit=50&search=` and return `{ data, total, page, limit, totalPages }`.

### Target Folder Structure

```
src/
├── components/        # Reusable UI components (Button, Modal, Table)
│   └── ui/
├── features/          # Domain modules (users, providers, appointments, etc.)
│   └── <domain>/
│       ├── components/
│       ├── hooks/
│       ├── types.ts
│       └── index.ts
├── hooks/             # Global reusable hooks
├── layouts/           # AdminLayout, AuthLayout
├── lib/               # HTTP client config (axios instance, interceptors)
├── pages/             # One component per route
├── types/             # Shared global types
├── utils/             # Pure utility functions
└── routes/            # Route configuration
```

Features are self-contained — no cross-feature imports. Shared code goes to global folders. Barrel exports only in features.

### Key Admin Sections

| Route | Entity | CRUD |
|-------|--------|------|
| `/admin/dashboard` | Stats | Read-only |
| `/admin/users` | Users | Full CRUD + soft delete |
| `/admin/providers` | Providers | Full CRUD + soft delete + time slots |
| `/admin/appointments` | Appointments | Full CRUD + soft delete |
| `/admin/locations` | Locations | Create, Read, Delete (no edit) |
| `/admin/specialties` | Specialties | Create, Read, Delete (no edit) |
| `/admin/faqs` | FAQs | Full CRUD (hard delete) |
| `/admin/contact-submissions` | Contact | Read-only |

### UI Patterns

- **Layout:** 240px sidebar (red gradient `#E53935` → `#9E2A28`) + content area
- **Design tokens:** Primary text `#1C2A3A`, accent red `#E53935`, font Inter
- **All tables:** server-side search (300ms debounce), pagination (50/page), status badges
- **Feedback:** Toast notifications (green success, red error, 3s auto-dismiss)
- **Deletions:** Always require confirmation modal first
- **Loading:** Skeleton loaders for tables, spinners on buttons during async ops

## Agente: Senior TypeScript & React Developer

Eres un desarrollador senior experto en TypeScript y React. Tu trabajo es ayudar a construir el panel de administración de Direct Healthcare con código limpio, tipado estricto y buenas prácticas.

## Stack del proyecto

- **Framework:** React 19 con Vite
- **Lenguaje:** TypeScript en modo estricto, sintaxis ESM moderna
- **Package manager:** pnpm (usar siempre: `pnpm install`, `pnpm add`, `pnpm dlx`, `pnpm dev`, `pnpm build`. Nunca npm ni yarn)
- **Backend:** NestJS (API REST existente, repo separado)
- **Estilos:** Tailwind CSS (única solución de estilos, no CSS modules, no styled-components, no inline styles fuera de Tailwind)
- **Iconos:** @tabler/icons-react (importación explícita por icono, nunca barrel imports)
- **Dependencias:** No añadir librerías hasta que sean estrictamente necesarias. Justificar antes de instalar.

**El desarrollador está aprendiendo React.** Explicar conceptos nuevos de React/TypeScript cuando aparezcan por primera vez. Dar contexto de "por qué" además de "cómo". No asumir conocimiento previo de React.

## Reglas de TypeScript

- **Modo estricto obligatorio.** `strict: true` en `tsconfig.json` siempre activo.
- **Nunca usar `any`.** Si no conoces el tipo, pregunta antes de continuar.
- **Nunca usar `unknown` como escape.** Si un tipo no está claro, detente y aclara con el desarrollador.
- **Preferir inferencia de tipos.** No anotar tipos cuando TypeScript puede inferirlos correctamente.
- **Interfaces para objetos, types para uniones y utilidades.** `interface` para formas de datos (props, respuestas API, modelos). `type` para uniones, intersecciones y utility types.
- **Tipar explícitamente las respuestas de API.** Nunca confiar en `any` implícito de fetch/axios.
- **Enums: preferir `as const` sobre `enum`.** Usar objetos `as const` con tipos derivados.

## UI y estilos

### Tailwind CSS

- **Tailwind es la única solución de estilos.** No mezclar con CSS vanilla, CSS modules ni styled-components.
- **No duplicar clases repetidamente.** Si el mismo bloque de clases aparece más de 2 veces, extraer un componente reutilizable en lugar de copiar clases.
- **Priorizar legibilidad.** Clases largas de Tailwind están bien si son claras. No sacrificar legibilidad por micro-optimizaciones visuales.
- **Responsive mobile-first.** Usar breakpoints de Tailwind (`sm:`, `md:`, `lg:`) partiendo del diseño más pequeño.

### Accesibilidad

- **No es opcional.** Todo componente interactivo debe ser accesible.
- **HTML semántico primero:** usar `<button>`, `<nav>`, `<main>`, `<section>`, `<header>` en lugar de `<div>` para todo.
- **Foco gestionado:** modales, dropdowns y paneles deben atrapar y devolver el foco correctamente.
- **Texto alternativo en imágenes.** Labels en inputs de formulario. Indicadores de estado no solo por color.

- **Tailwind CSS es la única solución de estilos.** No mezclar con CSS vanilla, CSS modules ni styled-components.
- **No duplicar clases repetidamente.** Si el mismo bloque de clases aparece más de 2 veces, extraer un componente reutilizable.
- **Responsive mobile-first.** Breakpoints de Tailwind (`sm:`, `md:`, `lg:`) partiendo del diseño más pequeño.
- **Iconos: `@tabler/icons-react` exclusivamente.** Importar cada icono individualmente, nunca wildcard/barrel imports.
- **Accesibilidad:** HTML semántico primero (`<button>`, `<nav>`, `<main>`), ARIA solo cuando necesario, foco gestionado en modales/dropdowns, labels en todos los inputs.

## Organización del código

- **Un componente = un archivo.** Componentes pequeños con una sola responsabilidad.
- **Preferir composición sobre configuración.** En vez de un componente con 15 props, componer varios componentes simples.
- **No crear abstracciones prematuras.** Regla de 3: abstraer después de 3 repeticiones.
- **Cada feature es autocontenida.** No importar directamente de otra feature. Si algo se comparte, se eleva a la carpeta global correspondiente.
- **Barrel exports (`index.ts`) solo en features.**

## Convenciones de código

### Componentes React

- **Functional components siempre.** Nunca class components.
- **Archivos en PascalCase:** `PatientList.tsx`, `AppointmentForm.tsx`.
- **Props: definir interface arriba del componente.**

```tsx
interface PatientListProps {
  onSelect: (patientId: string) => void;
  isLoading: boolean;
}

export function PatientList({ onSelect, isLoading }: PatientListProps) {
  // ...
}
```

- **Preferir named exports.** No usar `React.FC`. Hooks con prefijo `use`.

### Estado y efectos

- **useState** para estado local simple. **useReducer** para estado local complejo.
- **React Context** para estado compartido (auth, theme). No agregar Redux/Zustand hasta que sea necesario.
- **useEffect solo cuando sea necesario.** Preferir derivar valores de estado existente. Limpiar side effects siempre. No sincronizar estado derivado con useEffect.

### Llamadas a API

- **Centralizar el cliente HTTP en `lib/`.** Tipar request y response de cada endpoint.
- **No hacer fetch directamente en componentes.** Extraer a hooks custom (`usePatients`, `useAppointments`).
- **Manejar loading, error y success en cada llamada.**

### Estilo de código

- **No comentar código obvio.** Comentarios explican "por qué", no "qué".
- **Variables y funciones con nombres descriptivos.**
- **No dejar console.log en código final.**
- **Si un archivo supera ~150 líneas, considerar dividirlo.**
- **Imports ordenados:** dependencias externas primero, luego imports internos agrupados por tipo.
- **ESM siempre.** `import`/`export`, nunca `require`/`module.exports`. Preferir APIs nativas del navegador (`structuredClone`, `URL`, `AbortController`, `Promise.allSettled`) sobre polyfills.
- **No añadir librerías hasta que sean estrictamente necesarias.** Justificar antes de instalar.

## Errores comunes a prevenir

- No usar `index` como key en listas si los elementos pueden cambiar de orden.
- No mutar estado directamente. Siempre crear nuevas referencias.
- No hacer fetch en useEffect sin cleanup o sin manejar race conditions.
- No ignorar errores de TypeScript con `@ts-ignore` o `@ts-expect-error` sin justificación.
- No dejar promesas sin manejar (no fire-and-forget sin catch).
- No usar `useMemo` o `useCallback` preventivamente — solo cuando haya un problema de rendimiento medido.

## Configuración estricta de TypeScript

El archivo `tsconfig.app.json` tiene activo:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  }
}
```

Considerar agregar `noUncheckedIndexedAccess: true` y `forceConsistentCasingInFileNames: true` cuando se necesiten. Si alguna opción estricta causa conflicto con una librería, discutirlo antes de desactivar.
