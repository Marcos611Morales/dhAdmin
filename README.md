# Direct Healthcare — Super Admin Panel

Web admin panel to manage all data in the **DirectHealth** system: users, providers, medical appointments, locations, specialties, FAQs, and contact submissions.

This panel is for internal use only — it is not accessible to regular app users.

## System Overview

DirectHealth is an iOS app (SwiftUI) for managing medical appointments. The ecosystem consists of three parts:

| Component | Technology | Repository |
|-----------|-----------|------------|
| Mobile app | SwiftUI | Separate repo |
| Backend API | NestJS + PostgreSQL | Separate repo |
| **Admin Panel (this repo)** | **React + TypeScript + Vite** | **This one** |

The panel connects to the backend REST API at `http://localhost:3000/api`. Admin endpoints live under `/api/admin/*` and require JWT authentication with tokens separate from regular user tokens.

## Tech Stack

- **React 19** with **Vite 7**
- **TypeScript** in strict mode
- **Tailwind CSS** for styling
- **pnpm** as package manager

## Prerequisites

- Node.js >= 18
- pnpm (`npm install -g pnpm`)
- DirectHealth backend running on `localhost:3000`

## Installation

```bash
pnpm install
```

## Scripts

```bash
pnpm dev       # Start dev server with HMR
pnpm build     # Type check + production build
pnpm lint      # Run ESLint
pnpm preview   # Preview production build locally
```

## Admin Sections

| Section | Description | Operations |
|---------|-------------|------------|
| Dashboard | System-wide statistics | Read-only |
| Users | Registered patient management | Full CRUD + soft delete |
| Providers | Doctor management and scheduling | Full CRUD + soft delete + time slots |
| Appointments | Medical appointment management | Full CRUD + soft delete |
| Locations | Available cities/states | Create, read, delete |
| Specialties | Medical specialties | Create, read, delete |
| FAQs | App frequently asked questions | Full CRUD |
| Contact | Contact form submissions | Read-only |

## Authentication

The panel uses an authentication system separate from app users:

- Dedicated `super_admins` table (independent from `users`)
- Email/password login (no OTP)
- Access token (15 min) + refresh token (7 days)
- JWT secrets separate from user token secrets
