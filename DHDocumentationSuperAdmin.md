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
