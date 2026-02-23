# DirectHealth — Super Admin Web Panel: Documento de Contexto

Este documento contiene toda la informacion necesaria para construir el panel web de super administracion de DirectHealth.

---

## 1. Resumen del Proyecto

**DirectHealth** es una aplicacion iOS de gestion de citas medicas que permite a los pacientes buscar proveedores medicos, agendar citas, gestionar su perfil y recibir notificaciones. La aplicacion movil esta construida con SwiftUI y se conecta a un backend Node.js con base de datos PostgreSQL.

**El Super Admin Web Panel** es un sistema web independiente que permite a los administradores gestionar todos los datos del sistema: usuarios, proveedores, citas, ubicaciones, especialidades, FAQs y mas. El panel NO es accesible para los usuarios regulares de la app.

### Stack Tecnico

| Capa | Tecnologia |
|------|-----------|
| Frontend Web Admin | React |
| Backend | Node.js (existente, se agregan endpoints de admin) |
| Base de datos | PostgreSQL |
| Autenticacion | JWT (access token + refresh token) |
| API | REST, JSON, base URL: `http://localhost:3000/api` |

---

## 2. Cambios en Base de Datos

### Nueva Tabla: `super_admins`

La unica tabla nueva necesaria. Completamente separada de `users`. Todos los super admins tienen acceso completo al sistema (sin distincion de roles). La tabla `specialties` ya existe en el esquema actual como tabla propia con FK en `providers.specialty_id`, por lo que no se requiere migracion.

```sql
-- 008_super_admins.sql

BEGIN;

CREATE TABLE IF NOT EXISTS super_admins (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    first_name    VARCHAR(50) NOT NULL,
    last_name     VARCHAR(50) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uidx_super_admins_email UNIQUE (email)
);

-- Trigger para updated_at
CREATE TRIGGER trg_super_admins_set_updated_at
    BEFORE UPDATE ON super_admins
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Indices
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins (email);

COMMIT;
```

**Campos:**

| Columna | Tipo | Constraints |
|---------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| first_name | VARCHAR(50) | NOT NULL |
| last_name | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**Seed de un super admin inicial:**
```sql
-- Usar bcrypt hash para el password en el backend
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('CONTRASEÑA', 10).then(h => console.log(h))"

INSERT INTO super_admins (email, password_hash, first_name, last_name)
VALUES ('admin@directhealth.com', '<bcrypt_hash_aqui>', 'Super', 'Admin');
```

---

## 3. Design System para Web

El admin panel debe reflejar visualmente la misma identidad de la app movil: limpio, profesional, colores oscuros con acentos rojos.

### 3.1 Paleta de Colores

#### Variables CSS

```css
:root {
  /* ─── Colores Primarios ─── */
  --color-primary-red: #E53935;
  --color-primary-text: #1C2A3A;
  --color-primary-button: #1C2A3A;

  /* ─── Texto ─── */
  --color-text-primary: #1C2A3A;
  --color-text-secondary: #6B7580;
  --color-text-placeholder: #9CA3AF;
  --color-text-black: #1E1E1E;
  --color-text-notification-body: #414153;

  /* ─── Bordes ─── */
  --color-border-focus: #1C2A3A;
  --color-border-unfocus: #D1D5DB;
  --color-border-secondary: #E5E7EB;
  --color-divider: #E5E7EB;

  /* ─── Fondos ─── */
  --color-bg-white: #FFFFFF;
  --color-bg-input: #F9FAFB;
  --color-bg-light-gray: #F3F4F6;
  --color-bg-gray-button: #E5E7EB;

  /* ─── Botones ─── */
  --color-button-primary: #1C2A3A;
  --color-button-disabled: #9CA3AF;
  --color-button-negative-text: #E53935;

  /* ─── Estados ─── */
  --color-link: #1877F2;
  --color-success: #10B981;
  --color-icon: #9CA3AF;
  --color-icon-popup: #6B7280;
  --color-empty-state: #6A7282;

  /* ─── Gradiente Rojo (para header/sidebar) ─── */
  --color-gradient-red-start: #E53935;
  --color-gradient-red-end: #9E2A28;

  /* ─── Sombras ─── */
  --shadow-card: 0 1px 5px rgba(28, 42, 58, 0.1);
  --shadow-modal: 0 4px 20px rgba(0, 0, 0, 0.1);

  /* ─── Notificaciones: Fondos ─── */
  --color-noti-bg-blue: #DBEAFE;
  --color-noti-bg-orange: #FFEDD4;
  --color-noti-bg-green: #DCFCE7;
  --color-noti-bg-purple: #F3E8FF;
  --color-noti-bg-pink: #FFE2E2;
  --color-noti-bg-gray: #F3F4F6;

  /* ─── Notificaciones: Iconos ─── */
  --color-noti-icon-blue: #155DFC;
  --color-noti-icon-orange: #F54900;
  --color-noti-icon-green: #00A63E;
  --color-noti-icon-purple: #9810FA;
  --color-noti-icon-pink: #E7000B;
  --color-noti-icon-gray: #4A5565;
}
```

#### Resumen Visual de la Paleta

| Proposito | Color | Hex |
|-----------|-------|-----|
| Brand / Accent | Rojo | `#E53935` |
| Texto principal | Azul-gris oscuro | `#1C2A3A` |
| Texto secundario | Gris medio | `#6B7580` |
| Placeholder | Gris claro | `#9CA3AF` |
| Fondo inputs | Gris muy claro | `#F9FAFB` |
| Bordes activos | Azul-gris oscuro | `#1C2A3A` |
| Bordes inactivos | Gris claro | `#D1D5DB` |
| Divisores | Gris claro | `#E5E7EB` |
| Links | Azul | `#1877F2` |
| Exito / Check | Verde | `#10B981` |
| Boton primario | Azul-gris oscuro | `#1C2A3A` |
| Boton deshabilitado | Gris | `#9CA3AF` |
| Boton destructivo (texto) | Rojo | `#E53935` |
| Gradiente inicio | Rojo | `#E53935` |
| Gradiente fin | Rojo oscuro | `#9E2A28` |

### 3.2 Tipografia

**Familia**: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)

**Pesos disponibles:**

| Peso | CSS font-weight | Uso |
|------|-----------------|-----|
| Regular | 400 | Texto de cuerpo, descripciones, placeholders |
| Medium | 500 | Texto de cuerpo importante, labels de formularios |
| Semi-Bold | 600 | Subtitulos, headers de tarjetas, tabs activos |
| Bold | 700 | Titulos principales, headers de pagina |

**Escala de tamanios:**

| Nivel | Tamano | Peso | Uso |
|-------|--------|------|-----|
| H1 | 24px | Bold (700) | Titulo de pagina |
| H2 | 20px | Bold (700) | Subtitulos de seccion |
| H3 | 18px | Semi-Bold (600) | Headers de tarjetas, dialogs |
| Body Large | 16px | Medium (500) | Texto principal, labels |
| Body | 14px | Regular (400) | Texto de cuerpo, descripciones |
| Caption | 12px | Regular (400) | Timestamps, badges, texto secundario |

**CSS base:**
```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #1C2A3A;
  line-height: 1.5;
}
```

### 3.3 Estilos de Componentes

#### Botones

| Variante | Fondo | Texto | Borde | Uso |
|----------|-------|-------|-------|-----|
| Primary | `#1C2A3A` | `#FFFFFF` | ninguno | Acciones principales (Guardar, Crear, Confirmar) |
| Secondary | `#FFFFFF` | `#1C2A3A` | 1px `#E5E7EB` | Acciones secundarias (Cancelar, Cerrar) |
| Negative | `#FFFFFF` | `#E53935` | 1px `#E53935` | Acciones destructivas (Eliminar) |
| Gray | `#E5E7EB` | `#1C2A3A` | ninguno | Acciones terciarias (Ver detalle) |
| Disabled | `#9CA3AF` | `#FFFFFF` | ninguno | Cualquier boton deshabilitado (opacity: 0.6) |

```css
.btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary { background: #1C2A3A; color: #FFFFFF; border: none; }
.btn-secondary { background: #FFFFFF; color: #1C2A3A; border: 1px solid #E5E7EB; }
.btn-negative { background: #FFFFFF; color: #E53935; border: 1px solid #E53935; }
.btn-gray { background: #E5E7EB; color: #1C2A3A; border: none; }
```

#### Inputs / Text Fields

```css
.input-field {
  height: 40px;
  padding: 0 16px;
  background: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: #1C2A3A;
  transition: border-color 0.2s ease;
}
.input-field::placeholder { color: #9CA3AF; }
.input-field:focus {
  outline: none;
  border-color: #1C2A3A;
}
```

#### Tarjetas / Cards

```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 5px rgba(28, 42, 58, 0.1);
}
```

#### Tablas

```css
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6B7580;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}
.table td {
  font-size: 14px;
  color: #1C2A3A;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E7EB;
}
.table tr:hover { background: #F9FAFB; }
```

#### Modales

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.4);
}
.modal-content {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
}
.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1C2A3A;
  margin-bottom: 16px;
}
```

#### Status Badges

| Status | Fondo | Texto |
|--------|-------|-------|
| upcoming | `#DBEAFE` | `#155DFC` |
| past | `#F3F4F6` | `#6B7580` |
| cancelled | `#FFE2E2` | `#E53935` |
| available | `#DCFCE7` | `#10B981` |
| unavailable | `#FFE2E2` | `#E53935` |
| booked | `#FFEDD4` | `#F54900` |
| blocked | `#F3F4F6` | `#6B7580` |
| active (true) | `#DCFCE7` | `#10B981` |
| inactive (false) | `#F3F4F6` | `#6B7580` |

```css
.badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.badge-upcoming { background: #DBEAFE; color: #155DFC; }
.badge-past { background: #F3F4F6; color: #6B7580; }
.badge-cancelled { background: #FFE2E2; color: #E53935; }
.badge-available { background: #DCFCE7; color: #10B981; }
.badge-unavailable { background: #FFE2E2; color: #E53935; }
```

#### Search Box

```css
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 0 12px;
  height: 40px;
}
.search-box:focus-within { border-color: #1C2A3A; }
.search-box input {
  border: none;
  background: transparent;
  font-size: 14px;
  color: #1C2A3A;
  outline: none;
  width: 100%;
}
.search-box input::placeholder { color: #9CA3AF; }
.search-box .icon { color: #9CA3AF; font-size: 16px; }
```

#### Paginacion

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}
.pagination-info {
  font-size: 14px;
  color: #6B7580;
}
.pagination-buttons {
  display: flex;
  gap: 4px;
}
.pagination-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  font-size: 14px;
  color: #1C2A3A;
  cursor: pointer;
}
.pagination-btn.active {
  background: #1C2A3A;
  color: #FFFFFF;
  border-color: #1C2A3A;
}
```

---

## 4. API Endpoints del Super Admin

**Base URL:** `http://localhost:3000/api`

Todos los endpoints admin requieren un access token de super admin en el header:
```
Authorization: Bearer <admin_access_token>
```

El middleware de autenticacion admin debe verificar que el token pertenece a un registro de la tabla `super_admins` (NO de `users`).

### Patron Estandar de Paginacion

Todos los endpoints de listado (GET) aceptan estos query params:

| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| page | integer | 1 | Numero de pagina (min: 1) |
| limit | integer | 50 | Elementos por pagina (min: 1, max: 50) |
| search | string | - | Busqueda por texto (case-insensitive) |

**Respuesta paginada estandar:**
```json
{
  "data": [...],
  "total": 245,
  "page": 1,
  "limit": 50,
  "totalPages": 5
}
```

---

### 4.1 Auth Admin

#### POST `/api/admin/auth/sign-in`

Autenticacion directa con email y password. Sin OTP.

**Auth requerida:** No

**Request Body:**
```json
{
  "email": "admin@directhealth.com",
  "password": "securePass123"
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| email | string | Si | Email valido |
| password | string | Si | No vacio |

**Response: 200 OK**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@directhealth.com",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

**Errores:**
- `401 Unauthorized` - Email o password invalidos

---

#### POST `/api/admin/auth/sign-out`

**Auth requerida:** Si (admin token)

**Request Body:** Ninguno

**Response: 200 OK**
```json
{
  "message": "Signed out successfully"
}
```

---

#### POST `/api/admin/auth/refresh`

**Auth requerida:** No

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response: 200 OK**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "550e8400-...",
    "email": "admin@directhealth.com",
    "firstName": "Super",
    "lastName": "Admin"
  }
}
```

**Errores:**
- `401 Unauthorized` - Refresh token invalido o expirado

---

### 4.2 Dashboard

#### GET `/api/admin/dashboard/stats`

Retorna contadores generales del sistema.

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "totalUsers": 1250,
  "totalProviders": 155,
  "totalAppointments": 3420,
  "appointmentsByStatus": {
    "upcoming": 234,
    "past": 2890,
    "cancelled": 296
  },
  "totalLocations": 10,
  "totalSpecialties": 4
}
```

---

### 4.3 Users Management

#### GET `/api/admin/users`

Lista paginada de todos los usuarios del sistema.

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| search | string | Busca en first_name, last_name, email (case-insensitive) |
| gender | string | Filtra por gender (male, female, non_binary, other, prefer_not_to_say) |
| isEmailVerified | boolean | Filtra por estado de verificacion |
| includeDeleted | boolean | Si es true, incluye usuarios con soft delete (default: false) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "John",
      "middleName": null,
      "lastName": "Doe",
      "email": "john@example.com",
      "dateOfBirth": "1992-07-08",
      "gender": "male",
      "profileImageUrl": "https://...",
      "isEmailVerified": true,
      "createdAt": "2025-10-01T14:30:00.000Z",
      "updatedAt": "2025-10-15T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "total": 1250,
  "page": 1,
  "limit": 50,
  "totalPages": 25
}
```

---

#### GET `/api/admin/users/:id`

Detalle de un usuario especifico.

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "1992-07-08",
  "gender": "male",
  "profileImageUrl": "https://...",
  "isEmailVerified": true,
  "createdAt": "2025-10-01T14:30:00.000Z",
  "updatedAt": "2025-10-15T10:00:00.000Z",
  "deletedAt": null
}
```

**Errores:**
- `404 Not Found` - Usuario no encontrado

---

#### POST `/api/admin/users`

Crea un nuevo usuario.

**Auth requerida:** Si

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "dateOfBirth": "1992-07-08",
  "gender": "male",
  "isEmailVerified": true
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| firstName | string | Si | No vacio, max 50 chars |
| middleName | string | No | Max 50 chars |
| lastName | string | Si | No vacio, max 50 chars |
| email | string | Si | Email valido, unico en el sistema |
| password | string | Si | Min 8 caracteres |
| dateOfBirth | string | No | Formato YYYY-MM-DD |
| gender | string | No | Valor del enum gender_type |
| isEmailVerified | boolean | No | Default: false |

**Response: 201 Created** - Objeto del usuario creado

**Errores:**
- `409 Conflict` - Email ya existe
- `400 Bad Request` - Datos invalidos

---

#### PUT `/api/admin/users/:id`

Edita un usuario existente. Puede cambiar cualquier campo, incluyendo password.

**Auth requerida:** Si

**Request Body:** (todos los campos opcionales, solo enviar los que se quieran modificar)
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "password": "newSecurePass456",
  "dateOfBirth": "1992-07-08",
  "gender": "male",
  "isEmailVerified": true
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| firstName | string | No | No vacio si se envia, max 50 chars |
| middleName | string | No | Max 50 chars (enviar null para borrar) |
| lastName | string | No | No vacio si se envia, max 50 chars |
| email | string | No | Email valido, unico |
| password | string | No | Min 8 caracteres (se hashea antes de guardar) |
| dateOfBirth | string | No | Formato YYYY-MM-DD |
| gender | string | No | Valor del enum gender_type |
| isEmailVerified | boolean | No | true/false |

**Response: 200 OK** - Objeto del usuario actualizado

**Errores:**
- `404 Not Found` - Usuario no encontrado
- `409 Conflict` - Email ya existe (si se intenta cambiar)
- `400 Bad Request` - Datos invalidos

---

#### DELETE `/api/admin/users/:id`

Soft delete de un usuario (marca `deleted_at`).

**Auth requerida:** Si

**Request Body:** Ninguno

**Response: 200 OK**
```json
{
  "message": "User deleted successfully"
}
```

**Errores:**
- `404 Not Found` - Usuario no encontrado

---

#### GET `/api/admin/users/:id/appointments`

Lista paginada de todas las citas de un usuario especifico.

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| search | string | Busca en nombre del provider, razon de cita |
| status | string | Filtra por status (upcoming, past, cancelled) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "provider": {
        "id": "550e8400-...",
        "firstName": "Sam",
        "lastName": "Peterson",
        "title": "Dr.",
        "specialty": {
          "id": "770e8400-...",
          "name": "Primary Care"
        },
        "profileImageUrl": "https://...",
        "appointmentPrice": 150.00
      },
      "location": {
        "id": "660e8400-...",
        "displayName": "Bristol, VA"
      },
      "appointmentDate": "2025-10-15",
      "appointmentTime": "10:00",
      "status": "upcoming",
      "reason": "Routine checkup",
      "notes": null,
      "isFavorite": false,
      "createdAt": "2025-10-01T14:30:00.000Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### 4.4 Providers Management

#### GET `/api/admin/providers`

Lista paginada de todos los providers.

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Query Params adicionales:**

| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| page | integer | 1 | Numero de pagina (min: 1) |
| limit | integer | 50 | Items por pagina (min: 1, max: 50) |
| search | string | - | Busca en first_name, last_name (case-insensitive) |
| specialty | string (UUID) | - | Filtra por specialty_id |
| location | string (UUID) | - | Filtra por location_id |
| gender | string | - | Filtra por gender |
| status | string | - | Filtra por status (available, unavailable) |
| includeDeleted | boolean | false | Si es true, incluye providers con soft delete |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Sam",
      "lastName": "Peterson",
      "title": "Dr.",
      "specialty": {
        "id": "770e8400-...",
        "name": "Primary Care"
      },
      "location": {
        "id": "660e8400-...",
        "city": "Bristol",
        "state": "VA",
        "displayName": "Bristol, VA"
      },
      "profileImageUrl": "https://...",
      "gender": "male",
      "rating": 4.8,
      "yearsOfExperience": 12,
      "bio": "Board-certified family physician...",
      "appointmentPrice": 80.00,
      "status": "available",
      "nextAvailableDate": "2025-10-15",
      "insurances": ["Medicare", "Medicaid"],
      "languages": ["English", "Spanish"],
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T14:30:00.000Z",
      "deletedAt": null
    }
  ],
  "total": 155,
  "page": 1,
  "limit": 50,
  "totalPages": 4
}
```

**Notas de implementacion:**
- Sin filtro de status por default — devuelve todos los providers (available y unavailable) a menos que se filtre
- Ordenado por `created_at` DESC (mas recientes primero)
- Search usa `ILIKE` para matching parcial case-insensitive en first_name y last_name del provider
- Joins: specialty, location, insurances (ManyToMany), languages (ManyToMany)
- `insurances` y `languages` se devuelven como arrays de strings (solo nombres, no objetos)
- Providers soft-deleted excluidos por default; pasar `?includeDeleted=true` para incluirlos
- Archivos: `admin-providers.controller.ts`, `admin-providers.service.ts`, `admin-providers.module.ts`, `dto/list-admin-providers.dto.ts`

---

#### GET `/api/admin/providers/:id`

Detalle completo de un provider.

**Auth requerida:** Si

**Response: 200 OK** - Mismo shape que un elemento del listado.

**Errores:**
- `404 Not Found` - Provider no encontrado

---

#### POST `/api/admin/providers`

Crea un nuevo provider.

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Request Body:**
```json
{
  "firstName": "Sam",
  "lastName": "Peterson",
  "title": "Dr.",
  "specialtyId": "770e8400-e29b-41d4-a716-446655440000",
  "locationId": "660e8400-e29b-41d4-a716-446655440000",
  "profileImageUrl": "https://...",
  "gender": "male",
  "rating": 4.8,
  "yearsOfExperience": 12,
  "bio": "Board-certified family physician...",
  "appointmentPrice": 80.00,
  "status": "available",
  "nextAvailableDate": "2025-10-15",
  "insuranceIds": ["uuid1", "uuid2"],
  "languageIds": ["uuid1", "uuid2"]
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| firstName | string | Si | No vacio, max 50 chars |
| lastName | string | Si | No vacio, max 50 chars |
| title | string | No | Max 20 chars |
| specialtyId | string (UUID) | Si | Debe existir en tabla specialties |
| locationId | string (UUID) | Si | Debe existir en tabla locations |
| profileImageUrl | string | No | URL valida |
| gender | string | No | Valor del enum gender_type |
| rating | number | No | 1.0 - 5.0 |
| yearsOfExperience | integer | No | >= 0 |
| bio | string | No | Texto libre |
| appointmentPrice | number | No | >= 0 |
| status | string | No | available, unavailable (default: available) |
| nextAvailableDate | string | No | Formato YYYY-MM-DD |
| insuranceIds | array of UUID | No | Deben existir en tabla insurances |
| languageIds | array of UUID | No | Deben existir en tabla languages |

**Response: 201 Created** - Objeto del provider creado con specialty y location expandidos

**Errores:**
- `400 Bad Request` - Datos invalidos
- `404 Not Found` - Specialty, location, insurance o language no encontrados

**Notas de implementacion:**
- Valida existencia de specialtyId y locationId antes de crear
- Valida existencia de todos los insuranceIds y languageIds antes de crear
- Relaciones ManyToMany (insurances, languages) se guardan via TypeORM cascade en junction tables
- Despues de guardar, re-fetch con todos los joins para devolver respuesta completa expandida
- El status por default lo maneja la DB (`available` via column default)
- Respuesta tiene el mismo shape que los items del GET list (incluye insurances/languages como arrays de strings)
- Archivos modificados: `admin-providers.controller.ts`, `admin-providers.service.ts`, `admin-providers.module.ts`, nuevo `dto/create-admin-provider.dto.ts`

---

#### PUT `/api/admin/providers/:id`

Edita un provider existente.

**Auth requerida:** Si

**Request Body:** (todos los campos opcionales)
```json
{
  "firstName": "Sam",
  "lastName": "Peterson",
  "title": "Dr.",
  "specialtyId": "770e8400-...",
  "locationId": "660e8400-...",
  "gender": "male",
  "rating": 4.9,
  "yearsOfExperience": 13,
  "bio": "Updated bio...",
  "appointmentPrice": 85.00,
  "status": "available",
  "nextAvailableDate": "2025-11-01",
  "insuranceIds": ["uuid1", "uuid2", "uuid3"],
  "languageIds": ["uuid1"]
}
```

**Nota sobre `insuranceIds` y `languageIds`:** Si se envian, reemplazan completamente las relaciones existentes (DELETE + INSERT en tablas junction).

**Response: 200 OK** - Objeto del provider actualizado

**Errores:**
- `404 Not Found` - Provider no encontrado
- `400 Bad Request` - Datos invalidos

---

#### DELETE `/api/admin/providers/:id`

Soft delete de un provider (marca `deleted_at`).

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "Provider deleted successfully"
}
```

---

#### GET `/api/admin/providers/:id/appointments`

Lista paginada de todas las citas de un provider especifico.

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| search | string | Busca en nombre del paciente, razon |
| status | string | Filtra por status (upcoming, past, cancelled) |

**Response: 200 OK** - Misma estructura que `/api/admin/users/:id/appointments` pero incluyendo datos del usuario (paciente) en vez del provider:

```json
{
  "data": [
    {
      "id": "880e8400-...",
      "user": {
        "id": "550e8400-...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "location": {
        "id": "660e8400-...",
        "displayName": "Bristol, VA"
      },
      "appointmentDate": "2025-10-15",
      "appointmentTime": "10:00",
      "status": "upcoming",
      "reason": "Routine checkup",
      "notes": null,
      "createdAt": "2025-10-01T14:30:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

#### GET `/api/admin/providers/:id/time-slots`

Estado de implementacion: ✅ Implementado

Lista paginada de los time slots de un provider.

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| page | number | Pagina (default 1) |
| limit | number | Items por pagina (default 50, max 50) |
| date | string (YYYY-MM-DD) | Filtra por fecha especifica |
| status | string | Filtra por status (available, booked, blocked) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "aaa-bbb-ccc-...",
      "slotDate": "2025-10-15",
      "startTime": "08:00",
      "endTime": "08:30",
      "status": "available",
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

**Errores:**
- `404 Not Found` — Provider no encontrado
- `400 Bad Request` — Parametros invalidos (UUID mal formado, date con formato incorrecto, status invalido)

**Notas de implementacion:**
- Ordenado por `slot_date ASC`, `start_time ASC`
- El `:id` del provider se valida como UUID via `ParseUUIDPipe`
- Si no se envian filtros de `date` o `status`, retorna todos los time slots del provider

---

#### POST `/api/admin/providers/:id/time-slots`

Agrega uno o multiples time slots a un provider.

**Auth requerida:** Si

**Request Body:**
```json
{
  "slots": [
    {
      "slotDate": "2025-10-15",
      "startTime": "08:00",
      "endTime": "08:30"
    },
    {
      "slotDate": "2025-10-15",
      "startTime": "08:30",
      "endTime": "09:00"
    }
  ]
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| slots | array | Si | Min 1 elemento |
| slots[].slotDate | string | Si | Formato YYYY-MM-DD |
| slots[].startTime | string | Si | Formato HH:MM |
| slots[].endTime | string | Si | Formato HH:MM, mayor que startTime |

**Response: 201 Created**
```json
{
  "message": "Time slots created successfully",
  "created": 2
}
```

**Errores:**
- `404 Not Found` - Provider no encontrado
- `400 Bad Request` - Datos invalidos
- `409 Conflict` - Slot duplicado (provider + date + startTime ya existe)

---

#### DELETE `/api/admin/providers/:id/time-slots/:slotId`

Elimina un time slot especifico. Solo se pueden eliminar slots con status `available`. Si el slot tiene status `booked`, primero se debe cancelar la cita asociada.

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "Time slot deleted successfully"
}
```

**Errores:**
- `404 Not Found` - Slot no encontrado
- `400 Bad Request` - No se puede eliminar un slot con status `booked`

---

### 4.5 Appointments Management

#### GET `/api/admin/appointments`

Lista paginada de citas del sistema. **Sin filtro de status por default — retorna todas las citas (upcoming, past, cancelled).**

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Query Params adicionales:**

| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| search | string | - | Busca en nombre del paciente, nombre del provider, razon (case-insensitive via ILIKE) |
| status | string | - | Filtra por status (upcoming, past, cancelled). Sin default, retorna todos |
| userId | string (UUID) | - | Filtra por usuario especifico |
| providerId | string (UUID) | - | Filtra por provider especifico |
| locationId | string (UUID) | - | Filtra por location |
| dateFrom | string (YYYY-MM-DD) | - | Citas desde esta fecha |
| dateTo | string (YYYY-MM-DD) | - | Citas hasta esta fecha |
| includeDeleted | boolean | false | Si es true, incluye citas con soft delete |

**Notas de implementacion:**
- Sin filtro de status por default — si no se envia el param, retorna todas las citas (upcoming, past, cancelled)
- Orden: `appointment_date` DESC, luego `appointment_time` DESC (mas recientes primero)
- Joins: user, provider (con specialty), location se cargan automaticamente
- La respuesta incluye `deletedAt` cuando `includeDeleted=true`
- No se incluye `isFavorite` en la respuesta actual (requiere contexto de usuario)

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "880e8400-...",
      "user": {
        "id": "550e8400-...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "provider": {
        "id": "550e8400-...",
        "firstName": "Sam",
        "lastName": "Peterson",
        "title": "Dr.",
        "specialty": {
          "id": "770e8400-...",
          "name": "Primary Care"
        },
        "profileImageUrl": "https://...",
        "appointmentPrice": 150.00
      },
      "location": {
        "id": "660e8400-...",
        "displayName": "Bristol, VA"
      },
      "appointmentDate": "2025-10-15",
      "appointmentTime": "10:00",
      "status": "upcoming",
      "reason": "Routine checkup",
      "notes": null,
      "isFavorite": false,
      "createdAt": "2025-10-01T14:30:00.000Z"
    }
  ],
  "total": 3420,
  "page": 1,
  "limit": 50,
  "totalPages": 69
}
```

---

#### GET `/api/admin/appointments/:id`

Detalle de una cita especifica.

**Auth requerida:** Si

**Response: 200 OK** - Mismo shape que un elemento del listado.

---

#### POST `/api/admin/appointments`

Crea una cita para un usuario con un provider.

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Request Body:**
```json
{
  "userId": "550e8400-...",
  "providerId": "550e8400-...",
  "locationId": "660e8400-...",
  "timeSlotId": "770e8400-...",
  "appointmentDate": "2025-10-15",
  "appointmentTime": "10:00",
  "reason": "Routine checkup",
  "notes": "Patient requested morning appointment"
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| userId | string (UUID) | Si | Debe existir en tabla users |
| providerId | string (UUID) | Si | Debe existir en tabla providers |
| locationId | string (UUID) | Si | Debe existir en tabla locations |
| timeSlotId | string (UUID) | No | Si se envia, debe pertenecer al provider y estar available |
| appointmentDate | string | Si | Formato YYYY-MM-DD |
| appointmentTime | string | Si | Formato HH:MM |
| reason | string | No | Texto libre |
| notes | string | No | Texto libre |

**Response: 201 Created** - Objeto de la cita creada (mismo shape que los items del GET list)

**Errores:**
- `400 Bad Request` - Datos invalidos
- `404 Not Found` - User, provider, location o time slot no encontrados
- `400 Bad Request` - Time slot no pertenece al provider especificado
- `400 Bad Request` - Time slot no esta disponible (status != available)

**Notas de implementacion:**
- Valida existencia de userId, providerId y locationId antes de crear
- Si se envia timeSlotId: valida que pertenezca al provider, que tenga status `available`, y lo marca como `booked`
- Si no se envia timeSlotId: crea la cita con time_slot_id = null
- El status de la cita por default es `upcoming` (manejado por la DB via column default)
- Despues de guardar, re-fetch con todos los joins (user, provider con specialty, location) para devolver respuesta completa
- Archivos: `admin-appointments.controller.ts`, `admin-appointments.service.ts`, `admin-appointments.module.ts`, nuevo `dto/create-admin-appointment.dto.ts`

---

#### PUT `/api/admin/appointments/:id`

Edita una cita existente. Permite cambiar provider, fecha, hora, location, razon, notas y status.

**Auth requerida:** Si

**Request Body:** (todos los campos opcionales)
```json
{
  "providerId": "550e8400-...",
  "locationId": "660e8400-...",
  "timeSlotId": "770e8400-...",
  "appointmentDate": "2025-10-20",
  "appointmentTime": "14:00",
  "reason": "Updated reason",
  "notes": "Admin note added",
  "status": "cancelled"
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| providerId | string (UUID) | No | Debe existir en tabla providers |
| locationId | string (UUID) | No | Debe existir en tabla locations |
| timeSlotId | string (UUID) | No | Debe pertenecer al provider (nuevo o existente) |
| appointmentDate | string | No | Formato YYYY-MM-DD |
| appointmentTime | string | No | Formato HH:MM |
| reason | string | No | Texto libre |
| notes | string | No | Texto libre |
| status | string | No | upcoming, past, cancelled |

**Nota:** Si se cambia el provider o time slot, el sistema debe:
1. Liberar el time slot anterior (si existia, marcarlo como `available`)
2. Marcar el nuevo time slot como `booked` (si se proporciono)

**Response: 200 OK** - Objeto de la cita actualizada

---

#### DELETE `/api/admin/appointments/:id`

Soft delete de una cita (marca `deleted_at`). Si la cita tenia un time slot asociado, lo libera (marca como `available`).

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "Appointment deleted successfully"
}
```

---

### 4.6 Locations Management

#### GET `/api/admin/locations`

Lista paginada de todas las locations.

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Query Params adicionales:**

| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| page | integer | 1 | Numero de pagina (min: 1) |
| limit | integer | 50 | Items por pagina (min: 1, max: 50) |
| search | string | - | Busca en city, state, display_name (case-insensitive) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "660e8400-...",
      "city": "Bristol",
      "state": "VA",
      "displayName": "Bristol, VA",
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-09-01T10:00:00.000Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

**Notas de implementacion:**
- Ordenado alfabeticamente por `display_name` ASC
- Search usa `ILIKE` con logica OR en city, state y display_name
- Archivos: `admin-locations.controller.ts`, `admin-locations.service.ts`, `admin-locations.module.ts`, `dto/list-admin-locations.dto.ts`

---

#### POST `/api/admin/locations`

Crea una nueva location.

**Auth requerida:** Si

**Request Body:**
```json
{
  "city": "Roanoke",
  "state": "VA",
  "displayName": "Roanoke, VA"
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| city | string | Si | No vacio, max 100 chars |
| state | string | Si | No vacio, exactamente 2 chars (codigo estado) |
| displayName | string | Si | No vacio, max 150 chars, unico |

**Response: 201 Created** - Objeto de la location creada

**Errores:**
- `409 Conflict` - display_name ya existe

---

#### DELETE `/api/admin/locations/:id`

Elimina una location. Solo se puede eliminar si no tiene providers asociados.

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "Location deleted successfully"
}
```

**Errores:**
- `404 Not Found` - Location no encontrada
- `400 Bad Request` - No se puede eliminar, tiene providers asociados

---

### 4.7 Specialties Management

#### GET `/api/admin/specialties`

Lista paginada de todas las especialidades.

**Auth requerida:** Si

**Estado de implementacion:** ✅ Implementado

**Query Params adicionales:**

| Param | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| page | integer | 1 | Numero de pagina (min: 1) |
| limit | integer | 50 | Items por pagina (min: 1, max: 50) |
| search | string | - | Busca en name (case-insensitive) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "770e8400-...",
      "name": "Primary Care",
      "createdAt": "2025-09-01T10:00:00.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

**Notas de implementacion:**
- Ordenado alfabeticamente por `name` ASC
- Search usa `ILIKE` para matching parcial case-insensitive en name
- Archivos: `admin-specialties.controller.ts`, `admin-specialties.service.ts`, `admin-specialties.module.ts`, `dto/list-admin-specialties.dto.ts`

---

#### POST `/api/admin/specialties`

Crea una nueva especialidad.

**Auth requerida:** Si

**Request Body:**
```json
{
  "name": "Pediatrics"
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| name | string | Si | No vacio, max 100 chars, unico |

**Response: 201 Created** - Objeto de la specialty creada

**Errores:**
- `409 Conflict` - name ya existe

---

#### DELETE `/api/admin/specialties/:id`

Elimina una especialidad. Solo se puede eliminar si no tiene providers asociados.

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "Specialty deleted successfully"
}
```

**Errores:**
- `404 Not Found` - Specialty no encontrada
- `400 Bad Request` - No se puede eliminar, tiene providers asociados

---

### 4.8 FAQs Management

#### GET `/api/admin/faqs`

Lista paginada de todas las FAQs (activas e inactivas).

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| search | string | Busca en question, answer (case-insensitive) |
| isActive | boolean | Filtra por estado activo/inactivo |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "990e8400-...",
      "question": "How do I book an appointment?",
      "answer": "To book an appointment, go to the Home screen...",
      "displayOrder": 1,
      "isActive": true,
      "createdAt": "2025-09-01T10:00:00.000Z",
      "updatedAt": "2025-09-01T10:00:00.000Z"
    }
  ],
  "total": 6,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

#### POST `/api/admin/faqs`

Crea una nueva FAQ.

**Auth requerida:** Si

**Request Body:**
```json
{
  "question": "What payment methods do you accept?",
  "answer": "We accept all major credit and debit cards...",
  "displayOrder": 7,
  "isActive": true
}
```

| Campo | Tipo | Requerido | Validacion |
|-------|------|-----------|------------|
| question | string | Si | No vacio |
| answer | string | Si | No vacio |
| displayOrder | integer | Si | Unico, positivo |
| isActive | boolean | No | Default: true |

**Response: 201 Created** - Objeto de la FAQ creada

**Errores:**
- `409 Conflict` - displayOrder ya existe

---

#### PUT `/api/admin/faqs/:id`

Edita una FAQ existente.

**Auth requerida:** Si

**Request Body:** (todos los campos opcionales)
```json
{
  "question": "Updated question?",
  "answer": "Updated answer...",
  "displayOrder": 3,
  "isActive": false
}
```

**Response: 200 OK** - Objeto de la FAQ actualizada

---

#### DELETE `/api/admin/faqs/:id`

Elimina una FAQ completamente (hard delete).

**Auth requerida:** Si

**Response: 200 OK**
```json
{
  "message": "FAQ deleted successfully"
}
```

---

### 4.9 Contact Submissions (Solo lectura)

#### GET `/api/admin/contact-submissions`

Lista paginada de todos los formularios de contacto enviados por usuarios. Solo lectura.

**Auth requerida:** Si

**Query Params adicionales:**

| Param | Tipo | Descripcion |
|-------|------|-------------|
| search | string | Busca en message, nombre del usuario |
| inquiryType | string | Filtra por tipo (prescription_questions, visit_follow_up, billing, other_administrative) |
| userId | string (UUID) | Filtra por usuario especifico |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "aa0e8400-...",
      "user": {
        "id": "550e8400-...",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "inquiryType": "billing",
      "message": "I have a question about my last invoice...",
      "appointment": {
        "id": "880e8400-...",
        "appointmentDate": "2025-10-15",
        "appointmentTime": "10:00",
        "provider": {
          "firstName": "Sam",
          "lastName": "Peterson",
          "title": "Dr."
        }
      },
      "createdAt": "2025-10-20T09:15:00.000Z"
    }
  ],
  "total": 89,
  "page": 1,
  "limit": 50,
  "totalPages": 2
}
```

---

#### GET `/api/admin/contact-submissions/:id`

Detalle de un contact submission especifico.

**Auth requerida:** Si

**Response: 200 OK** - Mismo shape que un elemento del listado.

---

## 5. Pantallas del Admin Panel

### 5.1 Login

**Ruta:** `/admin/login`

**Componentes:**
- Logo DirectHealth centrado
- Campo email
- Campo password (con toggle mostrar/ocultar)
- Boton "Sign In" (primary)
- Mensaje de error debajo del formulario si las credenciales son invalidas

**Comportamiento:**
- POST a `/api/admin/auth/sign-in`
- Almacenar accessToken y refreshToken en memoria (o httpOnly cookies)
- Redirigir a Dashboard

---

### 5.2 Dashboard

**Ruta:** `/admin/dashboard`

**Componentes:**
- Header con saludo "Welcome, {firstName}" y boton de logout
- 6 stat cards con contadores:
  - Total Users (icono persona)
  - Total Providers (icono estetoscopio)
  - Total Appointments (icono calendario)
  - Upcoming Appointments (badge azul)
  - Total Locations (icono pin)
  - Total Specialties (icono estrella)
- Seccion de accesos rapidos (links a cada seccion del admin)

**Datos:** GET `/api/admin/dashboard/stats`

---

### 5.3 Users

**Ruta:** `/admin/users`

**Componentes:**
- Header "Users" con contador total (ej: "Users (1,250)")
- Search box (busca por nombre, email)
- Boton "Create User" (primary)
- Tabla con columnas:
  - Name (firstName + lastName)
  - Email
  - Gender
  - Date of Birth
  - Email Verified (badge si/no)
  - Status (activo/eliminado)
  - Created At
  - Actions (Edit, View Appointments, Delete)
- Paginacion (50 por pagina)

**Modales:**
- **Create User Modal:** Formulario con todos los campos de POST `/api/admin/users`
- **Edit User Modal:** Formulario pre-llenado con datos actuales, permite cambiar password

**Acciones en tabla:**
- Click en "Edit" → abre modal de edicion
- Click en "View Appointments" → navega a `/admin/users/:id/appointments`
- Click en "Delete" → popup de confirmacion → soft delete

---

### 5.4 User Appointments

**Ruta:** `/admin/users/:id/appointments`

**Componentes:**
- Header "Appointments for {firstName} {lastName}" con boton "Back to Users"
- Info card del usuario (nombre, email, fecha registro)
- Search box
- Filtro por status (All, Upcoming, Past, Cancelled)
- Boton "Create Appointment" (primary)
- Tabla con columnas:
  - Provider (nombre + specialty)
  - Location
  - Date
  - Time
  - Status (badge colored)
  - Reason
  - Actions (Edit, Delete)
- Paginacion (50 por pagina)

---

### 5.5 Providers

**Ruta:** `/admin/providers`

**Componentes:**
- Header "Providers" con contador total
- Search box (busca por nombre)
- Filtros: Specialty (dropdown), Location (dropdown), Gender (dropdown), Status (dropdown)
- Boton "Create Provider" (primary)
- Tabla con columnas:
  - Name (title + firstName + lastName)
  - Specialty
  - Location
  - Gender
  - Rating
  - Price
  - Status (badge available/unavailable)
  - Actions (Edit, View Appointments, Manage Slots, Delete)
- Paginacion (50 por pagina)

**Modales:**
- **Create Provider Modal:** Formulario completo con dropdowns para specialty, location, insurances (multi-select), languages (multi-select)
- **Edit Provider Modal:** Formulario pre-llenado

---

### 5.6 Provider Appointments

**Ruta:** `/admin/providers/:id/appointments`

**Componentes:**
- Header "Appointments for Dr. {lastName}" con boton "Back to Providers"
- Info card del provider (nombre, specialty, location)
- Search box
- Filtro por status
- Boton "Create Appointment" (primary) - asigna automaticamente este provider
- Tabla con columnas:
  - Patient (nombre + email)
  - Location
  - Date
  - Time
  - Status (badge)
  - Reason
  - Actions (Edit, Delete)
- Paginacion (50 por pagina)

---

### 5.7 Provider Time Slots

**Ruta:** `/admin/providers/:id/time-slots`

**Componentes:**
- Header "Time Slots for Dr. {lastName}" con boton "Back to Providers"
- Info card del provider
- Filtro por fecha (date picker)
- Filtro por status (All, Available, Booked, Blocked)
- Search box
- Boton "Add Time Slots" (primary)
- Tabla con columnas:
  - Date
  - Start Time
  - End Time
  - Status (badge: available/booked/blocked)
  - Actions (Delete - solo si available)
- Paginacion (50 por pagina)

**Modal "Add Time Slots":**
- Date picker para seleccionar fecha
- Campos para agregar multiples slots:
  - Start Time (HH:MM)
  - End Time (HH:MM)
  - Boton "+ Add another slot"
- Boton "Create Slots" (primary)

---

### 5.8 All Appointments

**Ruta:** `/admin/appointments`

**Componentes:**
- Header "All Appointments" con contador total
- Search box (busca por nombre paciente, nombre provider, razon)
- Filtros: Status (dropdown), Location (dropdown), Date Range (desde/hasta)
- Boton "Create Appointment" (primary)
- Tabla con columnas:
  - Patient (nombre + email)
  - Provider (nombre + specialty)
  - Location
  - Date
  - Time
  - Status (badge)
  - Reason
  - Actions (Edit, Delete)
- Paginacion (50 por pagina)

**Modales:**
- **Create Appointment Modal:** Dropdowns para User, Provider, Location; date picker, time input, reason textarea, notes textarea
- **Edit Appointment Modal:** Pre-llenado, permite cambiar provider, fecha, hora, status, etc.

---

### 5.9 Locations

**Ruta:** `/admin/locations`

**Componentes:**
- Header "Locations" con contador total
- Search box (busca por city, state, displayName)
- Boton "Create Location" (primary)
- Tabla con columnas:
  - Display Name
  - City
  - State
  - Created At
  - Actions (Delete)
- Paginacion (50 por pagina)

**Modal "Create Location":**
- Campo City
- Campo State (2 caracteres)
- Campo Display Name

**Nota:** No se permite editar locations. Si se necesita cambiar, eliminar y crear nueva.

---

### 5.10 Specialties

**Ruta:** `/admin/specialties`

**Componentes:**
- Header "Specialties" con contador total
- Search box (busca por name)
- Boton "Create Specialty" (primary)
- Tabla con columnas:
  - Name
  - Created At
  - Actions (Delete)
- Paginacion (50 por pagina)

**Modal "Create Specialty":**
- Campo Name

---

### 5.11 FAQs

**Ruta:** `/admin/faqs`

**Componentes:**
- Header "FAQs" con contador total
- Search box (busca en question/answer)
- Boton "Create FAQ" (primary)
- Tabla con columnas:
  - Display Order
  - Question (truncado a ~80 chars)
  - Answer (truncado a ~100 chars)
  - Active (badge si/no)
  - Created At
  - Actions (Edit, Delete)
- Paginacion (50 por pagina)

**Modales:**
- **Create FAQ Modal:** Question (textarea), Answer (textarea), Display Order (number), Is Active (checkbox)
- **Edit FAQ Modal:** Pre-llenado con datos actuales

---

### 5.12 Contact Submissions

**Ruta:** `/admin/contact-submissions`

**Componentes:**
- Header "Contact Submissions" con contador total
- Search box (busca en message, nombre usuario)
- Filtro por Inquiry Type (dropdown)
- Tabla con columnas (solo lectura, sin boton crear):
  - User (nombre + email)
  - Inquiry Type (badge)
  - Message (truncado)
  - Related Appointment (si existe)
  - Created At
  - Actions (View Detail)
- Paginacion (50 por pagina)

**Modal "View Detail":**
- Informacion completa del submission en modo read-only:
  - Datos del usuario
  - Tipo de consulta
  - Mensaje completo
  - Cita relacionada (si aplica)

---

## 6. Patrones Estandar

### 6.1 Layout General

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (240px)  │         Content Area            │
│                   │                                  │
│  Logo             │  Header (titulo + acciones)      │
│  ─────────────    │  ─────────────────────────────   │
│  Dashboard        │                                  │
│  Users            │  Search + Filtros + Boton        │
│  Providers        │                                  │
│  Appointments     │  Tabla / Cards                   │
│  Locations        │                                  │
│  Specialties      │                                  │
│  FAQs             │  Paginacion                      │
│  Contact          │                                  │
│  ─────────────    │                                  │
│  Sign Out         │                                  │
└─────────────────────────────────────────────────────┘
```

**Sidebar:**
- Fondo: gradiente de `#E53935` a `#9E2A28` (o color solido `#1C2A3A`)
- Texto: blanco
- Item activo: fondo con opacidad blanca 0.15, borde izquierdo 3px blanco
- Logo DirectHealth arriba
- Boton Sign Out abajo

### 6.2 Paginacion

Todas las tablas usan paginacion con:
- Maximo 50 elementos por pagina
- Query params: `?page=1&limit=50`
- UI muestra: "Showing 1-50 of 1,250 results"
- Botones: Previous, numeros de pagina, Next
- El contador total se muestra en el header de la seccion (ej: "Users (1,250)")

### 6.3 Search Box

- Presente en TODAS las vistas de tabla
- Busqueda server-side (envia query param `search` al backend)
- Debounce de 300ms antes de enviar la peticion
- Icono de lupa a la izquierda
- Placeholder: "Search {entidad}..." (ej: "Search users...")

### 6.4 Confirmacion de Eliminacion

Antes de cualquier accion destructiva (delete), mostrar popup de confirmacion:
- Titulo: "Delete {entidad}?"
- Mensaje: "Are you sure you want to delete {nombre}? This action cannot be undone."
- Botones: "Cancel" (secondary), "Delete" (negative)

### 6.5 Feedback de Operaciones

- **Exito:** Toast verde en esquina superior derecha, desaparece en 3 segundos
  - "User created successfully"
  - "Provider updated successfully"
  - "Appointment deleted successfully"
- **Error:** Toast rojo con mensaje de error del backend
  - "Email already exists"
  - "Cannot delete location with associated providers"

### 6.6 Loading States

- Skeleton loader en tablas mientras cargan datos
- Spinner en botones durante operaciones async
- Disable botones mientras se procesa la peticion

---

## 7. Esquema de BD Existente (Referencia)

### Diagrama de Relaciones

```
super_admins (NUEVA - independiente)

users ──< auth_providers
users ──< otp_codes
users ──< appointments
users ──< notifications
users ──< contact_submissions
users ──< users_favorite_providers >── providers
users ──< users_favorite_appointments >── appointments

providers >── locations
providers >── specialties
providers ──< appointments
providers ──< provider_schedules
providers ──< provider_time_slots
providers ──< providers_insurances >── insurances
providers ──< providers_languages >── languages

appointments >── locations
appointments >──< provider_time_slots
appointments ──< contact_submissions
appointments ──< users_favorite_appointments
```

### Tablas Existentes

| Tabla | Columnas Principales | Soft Delete |
|-------|---------------------|-------------|
| users | id, first_name, middle_name, last_name, email, password_hash, date_of_birth, gender, profile_image_url, is_email_verified | Si (deleted_at) |
| auth_providers | id, user_id (FK), provider_type, provider_user_id | No |
| otp_codes | id, user_id (FK), code, purpose, expires_at, is_used | No |
| locations | id, city, state, display_name | No |
| providers | id, first_name, last_name, title, specialty_id (FK), location_id (FK), gender, rating, years_of_experience, bio, appointment_price, status, next_available_date | Si (deleted_at) |
| specialties | id, name | No |
| provider_schedules | id, provider_id (FK), day_of_week, start_time, end_time, is_active | No |
| provider_time_slots | id, provider_id (FK), slot_date, start_time, end_time, status | No |
| insurances | id, name | No |
| languages | id, name | No |
| providers_insurances | provider_id (PK, FK), insurance_id (PK, FK) | No |
| providers_languages | provider_id (PK, FK), language_id (PK, FK) | No |
| appointments | id, user_id (FK), provider_id (FK), location_id (FK), time_slot_id (FK), appointment_date, appointment_time, status, reason, notes | Si (deleted_at) |
| users_favorite_providers | user_id (PK, FK), provider_id (PK, FK) | No |
| users_favorite_appointments | user_id (PK, FK), appointment_id (PK, FK) | No |
| notifications | id, user_id (FK), type, title, message, is_read | No |
| faqs | id, question, answer, display_order, is_active | No |
| contact_submissions | id, user_id (FK), inquiry_type, message, appointment_id (FK) | No |
| super_admins (NUEVA) | id, email, password_hash, first_name, last_name | No |

### Tipos ENUM Vigentes

| Tipo | Valores |
|------|---------|
| gender_type | male, female, non_binary, other, prefer_not_to_say |
| auth_provider_type | email, google |
| otp_purpose_type | account_verification, password_reset |
| provider_status_type | available, unavailable |
| appointment_status_type | upcoming, past, cancelled |
| time_slot_status_type | available, booked, blocked |
| day_of_week_type | monday, tuesday, wednesday, thursday, friday, saturday, sunday |
| notification_type | appointment_confirm, appointment_reminder, new_provider, payment, health_tip, app_update |
| inquiry_type | prescription_questions, visit_follow_up, billing, other_administrative |


### Tokens de Autenticacion

| Token | Duracion | Uso |
|-------|----------|-----|
| Access Token (user) | 15 minutos | Bearer header para endpoints protegidos |
| Refresh Token (user) | 7 dias | POST `/api/auth/refresh` |
| Access Token (admin) | 15 minutos | Bearer header para endpoints `/api/admin/*` |
| Refresh Token (admin) | 7 dias | POST `/api/admin/auth/refresh` |

**Nota:** Los tokens de admin deben usar un JWT secret diferente al de users para evitar que un token de usuario sea valido en endpoints admin y viceversa.

---

## 8. Notas Adicionales

### Seguridad
- Todos los endpoints `/api/admin/*` deben estar protegidos por un middleware que valide que el token JWT pertenece a un `super_admin`
- El JWT secret para admin debe ser diferente al de users (`JWT_ADMIN_ACCESS_SECRET`, `JWT_ADMIN_REFRESH_SECRET`)
- Passwords deben hashearse con bcrypt antes de almacenar

### Datos Existentes de Catalogo

**Locations (10 pre-existentes):**
Bristol VA, Hurley VA, Norton VA, Pennington Gap VA, Richlands VA, Vansant VA, Harold KY, Morristown TN, Bradshaw WV, Welch WV

**Specialties (4 pre-existentes):**
Primary Care, Mental Health, Substance Use, Longevity

**Insurances (9 pre-existentes):**
Medicare, Medicaid, Blue Cross Blue Shield, Aetna, Cigna, United Healthcare, Humana, WV CHIP, Workers Compensation

**Languages (23 pre-existentes):**
English, Spanish, French, German, Italian, Portuguese, Mandarin, Korean, Japanese, Arabic, Russian, Polish, Dutch, Czech, Hungarian, Romanian, Greek, Swedish, Turkish, Danish, Finnish, Norwegian, Hebrew

### Dependencias del Backend Existente
- **OTP emails actualmente mockeados**: los codigos OTP se loggean en la consola del server
- **Avatar storage mockeado**: se genera URL mock, no se persiste en S3/Cloudinary
- **Cron job de appointments**: corre cada minuto para marcar citas como `past` (timezone: America/Mexico_City)
- **Token blacklist**: no implementado aun, el cliente descarta tokens al cerrar sesion

### Variables de Entorno del Backend

| Variable | Descripcion | Default |
|----------|-------------|---------|
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USERNAME | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | - |
| DB_NAME | PostgreSQL database name | direc_health |
| JWT_ACCESS_SECRET | Secret para access tokens de users | - |
| JWT_REFRESH_SECRET | Secret para refresh tokens de users | - |
| JWT_ADMIN_ACCESS_SECRET | Secret para access tokens de admin (NUEVO) | - |
| JWT_ADMIN_REFRESH_SECRET | Secret para refresh tokens de admin (NUEVO) | - |
| PORT | Puerto de la aplicacion | 3000 |
