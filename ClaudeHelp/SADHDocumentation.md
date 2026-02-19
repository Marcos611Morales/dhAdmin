# DirectHealth Super Admin API Documentation

Base URL: `http://localhost:3000/api`

---

## Overview

The Super Admin API is a separate authentication and management system for DirectHealth administrators. It runs on the same backend but uses **completely isolated JWT secrets and validation** to ensure that user tokens cannot access admin endpoints and vice versa.

### Key Architecture Decisions

- Admin auth uses the `super_admins` table (not `users`)
- JWT tokens use different secrets (`JWT_ADMIN_ACCESS_SECRET` / `JWT_ADMIN_REFRESH_SECRET`)
- Token payloads use distinct types (`admin-access` / `admin-refresh`) to prevent cross-system usage
- Passport strategy registered as `jwt-admin` (separate from the user `jwt` strategy)
- Admin endpoints bypass the global user JWT guard via `@Public()` and apply `AdminJwtAuthGuard` explicitly
- All admin endpoints live under `/api/admin/*`

---

## Admin Authentication

Admin auth endpoints live under `/api/admin/auth/`. Sign-in and refresh are **public** (no Bearer token required). Sign-out requires a valid admin access token.

### POST /api/admin/auth/sign-in

Authenticates a super admin with email and password. No OTP required.

**Request Body:**
```json
{
  "email": "admin@directhealth.com",
  "password": "securePass123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Not empty |

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

**Errors:**
- `401 Unauthorized` — Invalid email or password

---

### POST /api/admin/auth/refresh

Exchanges a valid admin refresh token for a new pair of access and refresh tokens. This endpoint is public (no access token required).

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| refreshToken | string | Yes | Not empty |

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

**Errors:**
- `401 Unauthorized` — Invalid or expired refresh token
- `401 Unauthorized` — Invalid token type
- `401 Unauthorized` — Admin no longer exists

---

### POST /api/admin/auth/sign-out

Signs out the current admin. Requires a valid admin access token.

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
{
  "message": "Signed out successfully"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid admin access token

**Note:** Currently the server acknowledges the sign-out and the client should discard stored tokens. Same behavior as user auth — server-side token invalidation is not yet implemented.

---

## Authentication Details

### Token Separation (Users vs Admin)

| Concept | Users | Admin |
|---------|-------|-------|
| Passport strategy | `jwt` | `jwt-admin` |
| Access secret env var | `JWT_ACCESS_SECRET` | `JWT_ADMIN_ACCESS_SECRET` |
| Refresh secret env var | `JWT_REFRESH_SECRET` | `JWT_ADMIN_REFRESH_SECRET` |
| Access token payload type | `access` | `admin-access` |
| Refresh token payload type | `refresh` | `admin-refresh` |
| Validates against table | `users` | `super_admins` |
| Guard | `JwtAuthGuard` (global) | `AdminJwtAuthGuard` (explicit) |

### Admin Tokens

| Token | Lifetime | Usage |
|-------|----------|-------|
| Admin Access Token | 15 minutes | `Authorization: Bearer <token>` header for `/api/admin/*` endpoints |
| Admin Refresh Token | 7 days | Used to obtain new admin tokens via `POST /api/admin/auth/refresh` |

### JWT Payload Structure

**Admin Access Token:**
```json
{
  "sub": "admin-uuid",
  "email": "admin@directhealth.com",
  "type": "admin-access",
  "iat": 1698765432,
  "exp": 1698766332
}
```

**Admin Refresh Token:**
```json
{
  "sub": "admin-uuid",
  "email": "admin@directhealth.com",
  "type": "admin-refresh",
  "iat": 1698765432,
  "exp": 1699370232
}
```

### Password Requirements

- Hashed with bcrypt (same as user passwords)
- No sign-up endpoint — super admins are created directly in the database

---

## Guard Usage Pattern for Admin Endpoints

All admin controllers follow this pattern:

```typescript
@Public()                          // Bypasses the global user JwtAuthGuard
@UseGuards(AdminJwtAuthGuard)      // Applies admin-specific JWT validation
@Controller('admin/resource')
export class AdminResourceController { ... }
```

For the auth controller specifically, `@UseGuards(AdminJwtAuthGuard)` is applied only on `sign-out` (not on `sign-in` or `refresh`, since those are public).

---

## Database: super_admins Table

### SQL Script: 008_super_admins.sql

```sql
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

CREATE TRIGGER trg_super_admins_set_updated_at
    BEFORE UPDATE ON super_admins
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins (email);

COMMIT;
```

### Seeding a Super Admin

Generate a bcrypt hash and insert manually:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 12).then(h => console.log(h))"
```

```sql
INSERT INTO super_admins (email, password_hash, first_name, last_name)
VALUES ('admin@directhealth.com', '<bcrypt_hash_here>', 'Super', 'Admin');
```

### Table Schema

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| first_name | VARCHAR(50) | NOT NULL |
| last_name | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW(), auto-updated via trigger |

---

## Project Structure

```
src/admin/
├── entities/
│   └── super-admin.entity.ts          # TypeORM entity for super_admins table
├── super-admins.service.ts            # findByEmail, findById
├── super-admins.module.ts             # Exports SuperAdminsService
└── auth/
    ├── admin-auth.controller.ts       # POST sign-in, sign-out, refresh
    ├── admin-auth.service.ts          # Token generation, sign-in, refresh logic
    ├── admin-auth.module.ts           # Wires Passport, JWT, SuperAdminsModule
    ├── strategies/
    │   └── jwt-admin.strategy.ts      # Passport strategy 'jwt-admin'
    ├── dto/
    │   ├── admin-sign-in.dto.ts       # email + password validation
    │   └── admin-refresh-token.dto.ts # refreshToken validation
    └── interfaces/
        ├── admin-jwt-payload.interface.ts    # { sub, email, type }
        └── admin-auth-response.interface.ts  # { accessToken, refreshToken, admin }

src/common/guards/
└── admin-jwt-auth.guard.ts            # AuthGuard('jwt-admin')
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| JWT_ADMIN_ACCESS_SECRET | Secret for signing admin access tokens | - |
| JWT_ADMIN_REFRESH_SECRET | Secret for signing admin refresh tokens | - |

These are in addition to the existing user JWT variables (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). All four secrets **must be different values**.
