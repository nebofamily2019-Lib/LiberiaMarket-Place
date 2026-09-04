# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LibMarket** is a mobile-first community e-commerce SPA built for the Liberian market. The primary target audience is low-literacy users, so the UX prioritizes icon-first design, large touch targets (≥44px), voice/audio assistance, and supports both English and Liberian Pidgin.

## Repository Structure

```
/
├── frontend/          # React 19 + TypeScript SPA (Vite)
├── backend/           # Node.js + Express API (Sequelize ORM)
├── database/          # SQL schemas and migration scripts
└── docs/              # Architecture docs, design specs
```

## Commands

### Backend
```bash
cd backend
npm install
npm run dev            # Start with nodemon (hot reload) via src/start.js
npm start              # Production start via src/server.js
npm run migrate        # Run Sequelize migrations
npm run migrate:undo   # Undo last migration
npm run db:sync        # Sync database (dev only)
npm run create-admin   # Create an admin user
npm test               # Jest (runs in-memory SQLite, --runInBand required)
npm run test:watch
npm run test:coverage
npm run test:security  # Run auth.security.test.js only
npm run validate:env   # Validate required environment variables
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Vite dev server (http://localhost:5173)
npm run build          # tsc + vite build
npm test               # Vitest (interactive)
npm run test:run       # Vitest (non-interactive, CI mode)
npm run test:coverage
```

### Running a single test (backend)
```bash
cd backend
npx jest src/tests/auth.test.js --runInBand
```

### Running a single test (frontend)
```bash
cd frontend
npx vitest run src/pages/Home.test.tsx
```

## Environment Setup

Copy `.env.example` to `.env` in `backend/`:
```bash
cp backend/.env.example backend/.env
```

Key backend env vars:
- `NODE_ENV` — controls DB dialect (dev=SQLite, prod=PostgreSQL)
- `DB_DIALECT` — `sqlite` (dev) or `postgres` (prod)
- `JWT_SECRET` — must be 64+ random characters (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `VITE_API_URL` — frontend points to backend (default: `http://localhost:5000/api`)
- Cloudinary and Twilio keys are optional in dev (image upload falls back to local storage)

## Architecture

### Backend (`backend/src/`)
- **Entry**: `src/start.js` (dev) → `src/server.js` (Express app setup, exported for tests)
- **Models** (`src/models/`): Sequelize models with class-based pattern; `models/index.js` initializes all models, runs associations, and exports `syncDatabase()`
- **Controllers** (`src/controllers/`): Thin controllers that call model methods directly
- **Routes** (`src/routes/`): Mounted under `/api/*` in server.js
- **Middleware** (`src/middleware/`): `auth.js` exports `protect`, `optionalAuth`, `authorize`, `checkOwnership`
- **Socket** (`src/socket/socketManager.js`): Socket.io with JWT auth via cookie; tracks `userSockets` and `conversationRooms` maps

**Database**: Development and tests use SQLite (`:memory:` for tests). Production uses PostgreSQL with SSL. The `test` environment config in `src/config/database.js` forces `storage: ':memory:'`; the test setup file (`src/tests/setup.js`) aborts if not using in-memory to prevent wiping dev data.

**Auth flow**: JWT stored as httpOnly cookie (`token`). The `protect` middleware checks cookie first, then falls back to `Authorization: Bearer` header. Token revocation uses a `token_version` column on User — incrementing it invalidates all existing tokens for that user.

**Roles**: `buyer`, `seller`, `admin`. The `authorize(...roles)` middleware checks `req.user.roles` (array) or `req.user.role` (string) for backwards compatibility.

**CSRF**: Applied to all non-GET routes except `/api/auth/*`. Frontend fetches a token from `GET /api/csrf-token` on startup and sends it as `X-CSRF-Token` header. CSRF is skipped in the `test` environment.

**Rate limiting**: Auth routes: scoped per-route in `routes/auth.js` — only `POST /register`, `/login`, `/forgot-password` are limited (50 attempts / 2 min, successful requests don't count against it); `GET /me` and other read/session routes are never rate-limited. API routes (`middleware` in `server.js`): 1000 req / 15 min (dev), 600 (prod). Rate limiting is skipped entirely in `test`.

**Image uploads**: `src/middleware/secureImageUpload.js` / `imageUpload.js` use multer + sharp. Cloudinary is used in production (`USE_CLOUD_STORAGE=true`), local `uploads/` directory in dev.

### Frontend (`frontend/src/`)
- **Entry**: `main.tsx` → `App.tsx`
- **Routing**: React Router v7; all pages are lazy-loaded. `HamburgerMenu` and `BottomNav` are hidden on `/`, `/login`, `/register`
- **Context providers** (outermost first): `ErrorBoundary` → `AuthProvider` → `LanguageProvider` → `ToastProvider` → `Router`
- **Auth** (`context/AuthContext.tsx`): Calls `authService.getCurrentUser()` on mount to verify cookie-based session. Stores user in `localStorage` as a cache only.
- **API client** (`utils/api.ts`): Axios instance with `withCredentials: true`. Interceptor attaches CSRF token to mutating requests and auto-retries on CSRF 403.
- **Language** (`context/LanguageContext.tsx`): Toggles between `en` and `pidgin` translation objects; persists to `localStorage`.
- **Services** (`services/`): One file per domain (`authService`, `productService`, `categoryService`, `messageService`, etc.) — all use the shared `api` axios instance from `utils/api.ts`.

### Data Models (key relationships)
- `User` hasMany `Product` (as seller), `Conversation` (as buyer and seller), `Review`, `SavedItem`, `Notification`
- `Product` belongsTo `Category`, belongsTo `User` (seller), hasMany `Offer`, `Review`
- `Conversation` belongsTo `User` (buyer), `User` (seller), `Product` (listing); hasMany `Message`
- `Offer` links `Product` ↔ `User` with a price and status (`pending`/`accepted`/`rejected`/`expired`)
- `Payment` records Orange Money / MTN MoMo / Lonestar Money transactions linked to `User` and `Product`

### Liberia-Specific Constraints
- Phone numbers must be 9-digit Liberian format. Valid carrier prefixes: `77`, `76`, `88`, `86`, `87`, `55`, `44`, `33`, `22`. Validated in `frontend/src/utils/phoneValidation.ts` and backend Joi schemas. Accepted input forms: `0881234567`, `+231881234567`, `881234567`.
- 15 counties seeded in `County` model; used for product location filtering (`frontend/src/data/liberianLocations.ts`)
- Payment methods are Liberian mobile money only — no cards. Providers: Orange Money, MTN MoMo, Lonestar Money (`frontend/src/data/paymentMethods.ts`)
- UI must support voice-to-text input (`VoiceRecorder.tsx`, `VoiceInput.tsx`) for low-literacy users

### Key Product Fields
Products have several non-obvious fields worth knowing: `condition` enum (`new`/`like-new`/`good`/`fair`/`poor`), `status` enum (`active`/`sold`/`inactive`/`pending`), `is_negotiable` flag, auto-generated `slug`, `views` counter (skips increment when seller views own product), `tags` (JSON array), and `specifications` (JSON key-value). Soft delete uses `deleted_at` rather than physical deletion.

### Auth Details
Password reset flow: `POST /api/auth/forgot-password` issues a 20-byte random token stored SHA256-hashed in `reset_password_token` with a 10-minute expiry (`reset_password_expire`). `PUT /api/auth/reset-password/:token` consumes it. Changing password via `PUT /api/auth/update-password` requires the current password. Bcrypt salt rounds: 12.

## Key Conventions

- **Migrations over sync**: `sequelize.sync()` is commented out. Use `npm run migrate` to evolve the schema. New migrations go in `backend/migrations/`.
- **Response shape**: All API responses use `{ success: true/false, data/error, ... }`.
- **Frontend test utils**: Use `frontend/src/tests/test-utils.tsx` (wraps components in all providers) rather than plain `render` from RTL.
- **`start` vs `npm run dev`**: `npm run dev` uses `nodemon src/start.js` — `start.js` is a thin wrapper that just calls `server.js`. The `predev` hook runs `validate-env.js` before starting.
