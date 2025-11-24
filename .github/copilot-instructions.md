# Copilot Instructions for Liberia Marketplace

## Project Architecture

- **Monorepo Structure**:  
  - `frontend/`: React SPA (mobile-first, accessibility-focused)  
  - `backend/`: Node.js/Express API (JWT auth, SQLite/PostgreSQL)  
  - `database/`: SQL schema, migrations, seeds  
  - `docs/`: Architecture, API, and workflow documentation

- **Major Data Flows**:  
  - Auth: JWT tokens, httpOnly cookies, CORS configured for cross-origin frontend/backend  
  - Product/Offer: CRUD via REST API, category-based search, offer negotiation  
  - User: Multi-role (buyer/seller/admin), phone verification, ratings

## Developer Workflows

- **Development**:  
  - Start backend: `cd backend && npm run dev`  
  - Start frontend: `cd frontend && npm start`  
  - Hot reload enabled for both; run in separate terminals

- **Testing**:  
  - Backend: Jest + Supertest (`npm test`, `npm run test:watch`, `npm run test:coverage`)  
  - Frontend: Vitest + React Testing Library (`npm test` in `frontend/`)  
  - E2E: Playwright/Cypress (see `TEST-PLAN.md` for setup)  
  - Test data: `backend/src/scripts/seed-test-data.js`

- **Build & Deploy**:  
  - Build frontend: `cd frontend && npm run build`  
  - Build backend: `cd backend && npm run build` (if configured)  
  - Docker: See `Dockerfile`, `docker-compose.yml`  
  - CI/CD: GitHub Actions (`.github/workflows/deploy.yml`) runs tests, audits, builds, and deploys

## Key Conventions & Patterns

- **Environment Variables**:  
  - Use `.env.example` as template; never commit `.env`  
  - Validate env on startup (`backend/src/config/validateEnv.js`)

- **Security**:  
  - Always set secure, long JWT_SECRET in production  
  - CORS: `origin` set from env, `credentials: true`  
  - Cookies: `httpOnly`, `secure` in production, `sameSite: 'strict'`  
  - See `PRODUCTION-SECURITY-CHECKLIST.md` for deployment steps

- **Testing Strategy**:  
  - TDD encouraged for new features  
  - 90%+ backend, 80%+ frontend coverage targets  
  - Risk-based: prioritize auth, payments, data integrity  
  - Regression: full suite after bug fixes/new features

- **Accessibility & Localization**:  
  - Icon-first, minimal text, large touch targets  
  - Audio/voice prompts for key flows  
  - English + Liberian Pidgin variants

## Integration Points

- **Frontend/Backend**:  
  - API base URL set via env  
  - Auth flows use cookies, CORS, JWT  
  - Database: SQLite for dev/test, PostgreSQL for staging/prod

- **External Services**:  
  - Phone verification (see backend implementation)  
  - Future: Messaging, payment gateway, notifications (see `TEST-PLAN.md` for out-of-scope)

## Reference Files

- `README.md`, `backend/README.md`: Setup, architecture, and feature overview
- `PRODUCTION-SECURITY-CHECKLIST.md`: Security and deployment
- `TEST-PLAN.md`, `frontend/TEST_PLAN.md`: Testing strategy, coverage, and tools
- `MANUAL-RUN.md`: Step-by-step environment setup
- `docs/`: Architecture diagrams, API docs

---

**Feedback requested:**  
- Are any workflows, conventions, or integration points unclear or missing?  
- Is there a specific pattern or file you want documented in more detail?
