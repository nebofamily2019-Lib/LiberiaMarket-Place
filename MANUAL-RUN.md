# LibMarket — Manual Build & Run Guide

Working directory: C:\Users\Maeyen\CommunityE-commerce-SPA-Liberia

Prerequisites
- Node.js 18+ (22 OK) and npm
- PostgreSQL running locally
- Ports: 5000 (backend), 5173 (frontend) free

## 1) Environment variables

Easiest: copy the example file and edit it
```bash
cd backend
cp .env.example .env
# Then generate a real JWT_SECRET and paste it into .env:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
The defaults in `.env.example` use SQLite (`DB_DIALECT=sqlite`), so no
PostgreSQL setup is required for local development.

Key variables in `backend/.env`
```env
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
JWT_SECRET=<generate a 64+ char random string, see above>
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

To use PostgreSQL instead of SQLite, set:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=libmarket
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

Notes
- `CORS_ORIGIN` is the env var the backend actually reads (`backend/src/server.js`) — it must match the frontend's URL exactly.
- The server validates required env vars on startup (`backend/src/utils/validateEnv.js`) and will refuse to boot if `JWT_SECRET` is missing/placeholder, or if production is misconfigured.

## 2) Backend (Terminal 1)

Install deps and run
```bat
cd backend
npm install
npm install cors
npm run dev
```
Backend served at http://localhost:5000

Troubleshooting
- CORS: ensure FRONTEND_ALLOWED_ORIGINS includes http://localhost:5173 and restart.
- DB: create DB if missing:
  - Windows psql: psql -U postgres -c "CREATE DATABASE libmarket;"

## 3) Frontend (Terminal 2)

Install deps and run
```bat
cd frontend
npm install
npm run dev
```
Vite dev server at http://localhost:5173

Vite proxy
- frontend/vite.config.ts proxies “/api” to http://localhost:5000

## 4) Build commands

Frontend production build
```bat
cd frontend
npm run build
npm run preview  # optional local preview (default port 4173)
```

Backend production
```bat
cd backend
npm start
```

## 5) Tests

Backend
```bat
cd backend
npm test
# optional
npm run test:watch
npm run test:coverage
```

Frontend
```bat
cd frontend
npm test
```

## 6) Docker (backend only)

Build and run backend image
```bat
docker build -t libmarket-backend .
docker run -p 5000:5000 --env-file backend/.env libmarket-backend
```

## 7) Quick checks

- GET http://localhost:5000/api/auth/me with Authorization: Bearer <token> after login
- Frontend login/register should succeed without CORS errors
- Voice features:
  - SearchHeader: ‘Speaking…’ then ‘Listening…’, cancel works
  - AddProduct: prompts on focus, voice input works

## 8) Common issues

- EADDRINUSE:5000 or 5173 → free port or change config
- CORS preflight blocked → set FRONTEND_ALLOWED_ORIGINS, restart backend
- STT/TTS not working → test in Chrome; grant mic permission; mobiles work best
