# DirectHealth API Documentation

Base URL: `http://localhost:3000/api`

---

## Authentication

All auth endpoints are **public** (no Bearer token required) except `sign-out`.

### POST /api/auth/sign-up

Creates a new user account with email/password. Sends an OTP code for email verification.

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firstName | string | Yes | Not empty |
| middleName | string | No | - |
| lastName | string | Yes | Not empty |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 characters |

**Response: 201 Created**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isEmailVerified": false,
    "otpCode": "482913"
  }
}
```

**Errors:**
- `409 Conflict` — A user with this email already exists

---

### POST /api/auth/sign-in

Authenticates an existing user with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | - |

**Response: 200 OK**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid email or password

---

### POST /api/auth/verify-otp

Verifies a 6-digit OTP code. Used for email verification and password reset flow.

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "482913",
  "purpose": "account_verification"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| code | string | Yes | Exactly 6 characters |
| purpose | enum | Yes | `account_verification` or `password_reset` |

**Response: 200 OK (account_verification)**
```json
{
  "message": "Email verified successfully"
}
```

**Response: 200 OK (password_reset)**
```json
{
  "message": "OTP verified",
  "resetToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

The `resetToken` is a JWT valid for 10 minutes. Use it in the `reset-password` endpoint.

**Errors:**
- `400 Bad Request` — Invalid or expired OTP code
- `404 Not Found` — User not found

---

### POST /api/auth/resend-otp

Generates a new OTP code and invalidates any previous unused codes for the same purpose.

**Request Body:**
```json
{
  "email": "john@example.com",
  "purpose": "account_verification"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| purpose | enum | Yes | `account_verification` or `password_reset` |

**Response: 200 OK**
```json
{
  "message": "OTP code sent successfully"
}
```

**Errors:**
- `404 Not Found` — User not found

---

### POST /api/auth/reset-password

Resets the user's password using a reset token obtained from `verify-otp` with purpose `password_reset`.

**Full password reset flow:**
1. `POST /api/auth/resend-otp` with `purpose: "password_reset"` — sends OTP to email
2. `POST /api/auth/verify-otp` with the OTP code and `purpose: "password_reset"` — returns `resetToken`
3. `POST /api/auth/reset-password` with the `resetToken` and new password

**Request Body:**
```json
{
  "email": "john@example.com",
  "resetToken": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "newSecurePass456"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| resetToken | string | Yes | JWT from verify-otp |
| newPassword | string | Yes | Min 8 characters |

**Response: 200 OK**
```json
{
  "message": "Password reset successfully"
}
```

**Errors:**
- `400 Bad Request` — Invalid or expired reset token
- `400 Bad Request` — Invalid token type
- `400 Bad Request` — Invalid reset token for this user

---

### POST /api/auth/refresh

Exchanges a valid refresh token for a new pair of access and refresh tokens. This endpoint is public (no access token required).

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
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

**Errors:**
- `401 Unauthorized` — Invalid or expired refresh token
- `401 Unauthorized` — Invalid token type
- `401 Unauthorized` — User no longer exists

---

### POST /api/auth/sign-out

Signs out the current user. Requires a valid access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
{
  "message": "Signed out successfully"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

**Note:** Currently the server acknowledges the sign-out and the client should discard stored tokens. Server-side token invalidation via a refresh token blacklist table is planned for a future iteration.

---

## Users

All user endpoints require a valid access token (`Authorization: Bearer <token>`).

### GET /api/users/profile

Returns the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "middleName": null,
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "1992-07-08",
  "gender": "male",
  "profileImageUrl": "https://storage.example.com/avatars/...",
  "isEmailVerified": true
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — User not found

---

### PUT /api/users/profile

Updates the authenticated user's profile fields.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "dateOfBirth": "1992-07-08",
  "gender": "male"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| firstName | string | Yes | Not empty |
| middleName | string | No | - |
| lastName | string | Yes | Not empty |
| dateOfBirth | string | No | ISO 8601 date format (YYYY-MM-DD) |
| gender | enum | No | `male`, `female`, `non_binary`, `other`, `prefer_not_to_say` |

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
  "profileImageUrl": null,
  "isEmailVerified": true
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — User not found
- `400 Bad Request` — Validation errors (invalid gender, invalid date format, etc.)

---

### PUT /api/users/profile/avatar

Uploads a profile image for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:** `multipart/form-data`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| image | file | Yes | JPEG, PNG, or WebP. Max 5 MB |

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "John",
  "middleName": null,
  "lastName": "Doe",
  "email": "john@example.com",
  "dateOfBirth": "1992-07-08",
  "gender": "male",
  "profileImageUrl": "https://storage.example.com/avatars/uuid/avatar.jpg",
  "isEmailVerified": true
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — User not found
- `422 Unprocessable Entity` — Invalid file type or file too large

**Note:** Avatar storage is currently mocked. The file is accepted and validated but not persisted to external storage. A mock URL is generated and saved to the database. Replace with S3/Cloudinary integration in a future iteration.

---

### POST /api/users/favorite-providers/:id

Adds a provider to the authenticated user's favorites. Idempotent — calling it again for the same provider returns a success message without error.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:** None

**Response: 201 Created**
```json
{
  "message": "Provider added to favorites"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Provider not found
- `400 Bad Request` — Invalid UUID format

---

### DELETE /api/users/favorite-providers/:id

Removes a provider from the authenticated user's favorites.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:** None

**Response: 200 OK**
```json
{
  "message": "Provider removed from favorites"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Favorite not found
- `400 Bad Request` — Invalid UUID format

---

### GET /api/users/favorite-providers

Returns the authenticated user's list of favorite providers, ordered by most recently favorited first.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Sam",
    "lastName": "Peterson",
    "title": "Dr.",
    "specialty": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Primary Care"
    },
    "location": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
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
    "isFavorite": true
  }
]
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

## Providers

All provider endpoints require a valid access token (`Authorization: Bearer <token>`).

### GET /api/providers

Returns a paginated list of providers with optional filters.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location | string (UUID) | No | Filter by location ID |
| specialty | string (UUID) | No | Filter by specialty ID |
| gender | enum | No | `male`, `female`, `non_binary`, `other`, `prefer_not_to_say` |
| search | string | No | Search by first or last name (case-insensitive) |
| page | integer | No | Page number (default: 1, min: 1) |
| limit | integer | No | Items per page (default: 20, min: 1, max: 100) |

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
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Primary Care"
      },
      "location": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
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
      "insurances": ["Medicare", "Medicaid", "Blue Cross Blue Shield"],
      "languages": ["English", "Spanish"],
      "isFavorite": true
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

Results are ordered by rating (highest first), then by last name alphabetically. Soft-deleted providers are excluded.

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `400 Bad Request` — Invalid query parameters (bad UUID, invalid enum value, etc.)

---

### GET /api/providers/summary

Returns a paginated list of providers with only essential fields. Supports the same filters as `GET /api/providers`.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| location | string (UUID) | No | Filter by location ID |
| specialty | string (UUID) | No | Filter by specialty ID |
| gender | enum | No | `male`, `female`, `non_binary`, `other`, `prefer_not_to_say` |
| search | string | No | Search by first or last name (case-insensitive) |
| page | integer | No | Page number (default: 1, min: 1) |
| limit | integer | No | Items per page (default: 20, min: 1, max: 100) |

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
        "id": "770e8400-e29b-41d4-a716-446655440000",
        "name": "Primary Care"
      },
      "gender": "male",
      "location": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "displayName": "Bristol, VA"
      },
      "profileImageUrl": "https://...",
      "appointmentPrice": 75.00,
      "isFavorite": false
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

Results are ordered by rating (highest first), then by last name alphabetically. Soft-deleted providers are excluded.

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `400 Bad Request` — Invalid query parameters (bad UUID, invalid enum value, etc.)

---

### GET /api/providers/:id

Returns detailed information for a single provider, including insurances, languages, and whether the current user has favorited them.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "firstName": "Sam",
  "lastName": "Peterson",
  "title": "Dr.",
  "specialty": {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Primary Care"
  },
  "location": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
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
  "insurances": ["Medicare", "Medicaid", "Blue Cross Blue Shield"],
  "languages": ["English", "Spanish"],
  "isFavorite": true
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Provider not found
- `400 Bad Request` — Invalid UUID format

---

### GET /api/providers/:id/availability

Returns time slots for a provider on a specific date.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Query Parameters:**

| Param | Type | Required | Validation |
|-------|------|----------|------------|
| date | string | Yes | ISO 8601 date format (YYYY-MM-DD) |
| time | string | No | Military time format (HH:MM). Filters slots with startTime >= time |

**Response: 200 OK**

Only returns slots with status `available`. If `time` is provided, only slots with `startTime >= time` are returned.

```json
{
  "providerId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-10-15",
  "slots": [
    { "id": "aaa...", "startTime": "08:00", "endTime": "08:30", "status": "available" },
    { "id": "bbb...", "startTime": "09:00", "endTime": "09:30", "status": "available" }
  ]
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Provider not found
- `400 Bad Request` — Missing or invalid date parameter, invalid UUID format

---

### GET /api/providers/:id/schedules

Returns the provider's weekly schedule (active entries only), ordered Monday through Sunday.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Response: 200 OK**
```json
{
  "providerId": "550e8400-e29b-41d4-a716-446655440000",
  "schedules": [
    { "id": "aaa...", "dayOfWeek": "monday", "startTime": "08:00", "endTime": "17:00", "isActive": true },
    { "id": "bbb...", "dayOfWeek": "tuesday", "startTime": "08:00", "endTime": "17:00", "isActive": true },
    { "id": "ccc...", "dayOfWeek": "wednesday", "startTime": "08:00", "endTime": "12:00", "isActive": true }
  ]
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Provider not found
- `400 Bad Request` — Invalid UUID format

---

## Appointments

All appointment endpoints require a valid access token (`Authorization: Bearer <token>`).

### Scheduled Task: Mark Past Appointments

A cron job runs **every minute** and automatically updates the status of appointments from `upcoming` to `past` when their `appointment_date` and `appointment_time` have passed. No manual intervention is needed — the transition is handled server-side by `AppointmentsTasksService`.

**Timezone:** All date/time comparisons in the appointments module (cron job, upcoming query, and date persistence) currently use the `America/Mexico_City` (GMT-6) timezone. This is hardcoded for testing purposes and should be updated to use dynamic timezone handling (e.g., from user/provider settings or a global configuration) when real data is implemented.

### POST /api/appointments

Creates a new appointment. If a `timeSlotId` is provided, the corresponding time slot is marked as `booked`.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "providerId": "550e8400-e29b-41d4-a716-446655440000",
  "locationId": "660e8400-e29b-41d4-a716-446655440000",
  "timeSlotId": "770e8400-e29b-41d4-a716-446655440000",
  "appointmentDate": "2025-10-15",
  "appointmentTime": "10:00",
  "reason": "Routine checkup"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| providerId | string | Yes | Valid UUID, provider must exist |
| locationId | string | Yes | Valid UUID, location must exist |
| timeSlotId | string | No | Valid UUID, must belong to provider and be available |
| appointmentDate | string | Yes | ISO 8601 date format (YYYY-MM-DD) |
| appointmentTime | string | Yes | Time string (HH:MM) |
| reason | string | No | Free text |

**Response: 201 Created**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "provider": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Sam",
    "lastName": "Peterson",
    "title": "Dr.",
    "specialty": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Primary Care"
    },
    "profileImageUrl": "https://...",
    "appointmentPrice": 150.00
  },
  "location": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
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
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Provider or location not found
- `400 Bad Request` — Invalid request body, time slot not available, or time slot does not belong to provider

---

### GET /api/appointments

Returns a paginated list of the authenticated user's appointments with optional status filter.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | enum | No | `upcoming`, `past`, `cancelled` |
| page | integer | No | Page number (default: 1, min: 1) |
| limit | integer | No | Items per page (default: 20, min: 1, max: 100) |

**Response: 200 OK**
```json
{
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "provider": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "firstName": "Sam",
        "lastName": "Peterson",
        "title": "Dr.",
        "specialty": {
          "id": "770e8400-e29b-41d4-a716-446655440000",
          "name": "Primary Care"
        },
        "profileImageUrl": "https://...",
        "appointmentPrice": 150.00
      },
      "location": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
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
  "limit": 20,
  "totalPages": 1
}
```

Results are ordered by appointment date (most recent first), then by appointment time. Soft-deleted appointments are excluded.

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `400 Bad Request` — Invalid query parameters (invalid enum value, etc.)

---

### GET /api/appointments/upcoming

Returns the user's nearest upcoming appointment (status `upcoming` with date/time >= now). Returns `null` if there are no upcoming appointments.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response: 200 OK**
```json
{
  "id": "a1b2c3d4-...",
  "provider": {
    "id": "550e8400-...",
    "firstName": "John",
    "lastName": "Doe",
    "title": "MD",
    "specialty": { "id": "51471914-...", "name": "Primary Care" },
    "profileImageUrl": "https://example.com/photo.jpg",
    "appointmentPrice": 150.00
  },
  "location": {
    "id": "217d8737-...",
    "displayName": "Bristol, VA"
  },
  "appointmentDate": "2026-02-20",
  "appointmentTime": "10:00",
  "status": "upcoming",
  "reason": "Annual checkup",
  "notes": null,
  "isFavorite": false,
  "createdAt": "2026-02-15T10:00:00.000Z"
}
```

If there are no upcoming appointments, the response is:
```json
null
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

### GET /api/appointments/:id

Returns detailed information for a single appointment. Users can only access their own appointments.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Response: 200 OK**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "provider": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Sam",
    "lastName": "Peterson",
    "title": "Dr.",
    "specialty": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "name": "Primary Care"
    },
    "profileImageUrl": "https://...",
    "appointmentPrice": 150.00
  },
  "location": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "displayName": "Bristol, VA"
  },
  "appointmentDate": "2025-10-15",
  "appointmentTime": "10:00",
  "status": "upcoming",
  "reason": "Routine checkup",
  "notes": null,
  "isFavorite": true,
  "createdAt": "2025-10-01T14:30:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Appointment not found (or belongs to another user)
- `400 Bad Request` — Invalid UUID format

---

### PUT /api/appointments/:id/reschedule

Reschedules an upcoming appointment. If the appointment had a time slot, it is released back to `available`. If a new `newTimeSlotId` is provided, it is validated and marked as `booked`.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:**
```json
{
  "newDate": "2025-10-20",
  "newTime": "14:00",
  "newTimeSlotId": "990e8400-e29b-41d4-a716-446655440000",
  "reason": "Updated reason"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| newDate | string | Yes | ISO 8601 date format (YYYY-MM-DD) |
| newTime | string | Yes | Time string (HH:MM) |
| newTimeSlotId | string | No | Valid UUID, must belong to provider and be available |
| reason | string | No | Replaces existing reason if provided |

**Response: 200 OK** — Updated appointment object (same shape as detail)

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Appointment not found (or belongs to another user)
- `400 Bad Request` — Invalid UUID, appointment is not `upcoming`, time slot not available, or time slot does not belong to provider

---

### PUT /api/appointments/:id/cancel

Cancels an upcoming appointment. Sets the status to `cancelled` and releases the associated time slot (if any) back to `available`.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:** None

**Response: 200 OK** — Appointment object with status `cancelled`

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Appointment not found (or belongs to another user)
- `400 Bad Request` — Invalid UUID or appointment is not `upcoming`

---

### POST /api/appointments/:id/favorite

Adds an appointment to the authenticated user's favorites. Idempotent — calling it again for the same appointment returns a success message without error. Users can only favorite their own appointments.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:** None

**Response: 201 Created**
```json
{
  "message": "Appointment added to favorites"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Appointment not found (or belongs to another user)
- `400 Bad Request` — Invalid UUID format

---

### DELETE /api/appointments/:id/favorite

Removes an appointment from the authenticated user's favorites.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**

| Param | Type | Validation |
|-------|------|------------|
| id | string | Valid UUID |

**Request Body:** None

**Response: 200 OK**
```json
{
  "message": "Appointment removed from favorites"
}
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token
- `404 Not Found` — Favorite not found
- `400 Bad Request` — Invalid UUID format

---

## Catalogs

All catalog endpoints require a valid access token (`Authorization: Bearer <token>`).

### GET /api/specialties

Returns all available specialties sorted alphabetically by name.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "name": "Primary Care"
  }
]
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

### GET /api/locations

Returns all clinic locations sorted alphabetically by display name.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "city": "Bristol",
    "state": "VA",
    "displayName": "Bristol, VA"
  }
]
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

### GET /api/insurances

Returns all available insurance providers sorted alphabetically by name.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Aetna"
  }
]
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

### GET /api/languages

Returns all available languages sorted alphabetically by name.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Response: 200 OK**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "English"
  }
]
```

**Errors:**
- `401 Unauthorized` — Missing or invalid access token

---

## Authentication Details

### Tokens

| Token | Lifetime | Usage |
|-------|----------|-------|
| Access Token | 15 minutes | `Authorization: Bearer <token>` header for protected endpoints |
| Refresh Token | 7 days | Used to obtain new access tokens via `POST /api/auth/refresh` |
| Reset Token | 10 minutes | Used exclusively in the `reset-password` endpoint |

### OTP Codes

- 6-digit numeric codes
- Valid for 10 minutes
- When a new OTP is generated, previous unused OTPs for the same user + purpose are invalidated
- Currently emails are mocked (OTP codes are logged to server console)

### Password Requirements

- Minimum 8 characters

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USERNAME | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | - |
| DB_NAME | PostgreSQL database name | direc_health |
| JWT_ACCESS_SECRET | Secret for signing access tokens | - |
| JWT_REFRESH_SECRET | Secret for signing refresh tokens | - |
| PORT | Application port | 3000 |
