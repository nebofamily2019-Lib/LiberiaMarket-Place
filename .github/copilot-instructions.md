# Copilot Instructions for Liberia Marketplace

## Project Context & Architecture

- **Monorepo Structure**:
  - `frontend/`: React SPA (Vite, Mobile-first, Accessibility-focused)
  - `backend/`: Node.js/Express API (Sequelize ORM)
  - `database/`: SQL schema, migrations, seeds

- **Tech Stack**:
  - **Frontend**: React, Vite, CSS Variables (Design Tokens)
  - **Backend**: Node.js, Express, Sequelize
  - **Database**: PostgreSQL (Production), SQLite (Dev/Test)
  - **Auth**: JWT (httpOnly cookies), Phone-based verification (Liberian 9-digit format)

## Critical Developer Workflows

- **Backend Setup**:
  - Install: `cd backend && npm install`
  - Dev Server: `cd backend && npm run dev` (uses `nodemon`)
  - Database: `npm run migrate` (Sequelize migrations)
  - **Testing**:
    - Unit/Integration: `npm test` (Jest)
    - Watch Mode: `npm run test:watch`
    - Coverage: `npm run test:coverage` (Target: 90%+)
    - Security: `npm run test:security`

- **Frontend Setup**:
  - Install: `cd frontend && npm install`
  - Dev Server: `cd frontend && npm start` (Vite)
  - Build: `npm run build`
  - **Testing**:
    - Unit: `npm test` (Vitest + React Testing Library)
    - Coverage Target: 80%+

- **Full Stack Run**:
  - Run backend and frontend in separate terminals.
  - Ensure `.env` files are configured (see `.env.example`).

## Key Conventions & Patterns

- **Security First**:
  - **Env Vars**: Validate on startup (`backend/src/config/validateEnv.js`). Never commit `.env`.
  - **JWT**: Use secure, long `JWT_SECRET`. Store in httpOnly cookies.
  - **CORS**: strict origin configuration.

- **Accessibility & AI-First UX (Critical)**:
  - **Target Audience**: Low-literacy users in Liberia.
  - **Design**: Icon-first, minimal text, large touch targets (≥44px).
  - **Audio/Voice**: TTS prompts for forms, audio confirmations.
  - **Localization**: English + Liberian Pidgin variants.
  - **AI Features**: Smart form fill, auto-generated descriptions, voice-to-text.

- **Database & Data**:
  - Use Sequelize for all DB interactions.
  - Migrations in `backend/migrations` or `database/migrations`.
  - Seed data available in `backend/seeders`.

## Integration Points

- **API Communication**:
  - Frontend uses `VITE_API_URL` to talk to Backend.
  - Standardized error responses (JSON).

- **External Services**:
  - **Cloudinary**: Image uploads.
  - **Twilio** (implied): SMS/Phone verification.

## Reference Files

- **Architecture**: `README.md`, `backend/README.md`
- **Security**: `backend/SECURITY.md`
- **Deployment**: `DOCKER-DEPLOYMENT.md`, `MANUAL-RUN.md`
