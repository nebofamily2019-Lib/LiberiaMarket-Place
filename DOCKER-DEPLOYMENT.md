# LibMarket Docker & Go-Live Guide

## Overview

LibMarket is deployed as three self-hosted Docker containers (frontend/Nginx, backend/Node, Postgres) via `docker-compose.prod.yml` — no cloud PaaS (Render/Netlify/Railway/Vercel), no Kubernetes. This is the confirmed, single deployment target. CI (`.github/workflows/docker-build-push.yml`) only builds and pushes images to Docker Hub on a tag push — it does not deploy anything. Deploying is a manual step you run yourself, on whichever server you've chosen.

For local day-to-day development (no Docker), see `MANUAL-RUN.md` and the root `CLAUDE.md`.

## Docker Images

### Backend (`Dockerfile.backend`)
- **Base**: `node:22-alpine`
- Multi-stage build (separate `dependencies` stage for native modules), production `npm install --production`
- Build: `docker build -f Dockerfile.backend -t libmarket-backend:latest .`

### Frontend (`Dockerfile.frontend`)
- **Base**: `node:22-alpine` (build) → `nginx:alpine` (serve)
- Nginx proxies `/api` and `/uploads` to the backend container (see `nginx.conf`)
- Build: `docker build -f Dockerfile.frontend -t libmarket-frontend:latest .`

## First-Time Go-Live Steps (on a fresh VPS)

1. **Provision a server**: any Linux VPS with Docker + Docker Compose installed (DigitalOcean/Hetzner/Linode droplet, ~$6-12/mo — no proprietary lock-in). Point a domain's A record at its IP.
2. **Harden it**: SSH key-only auth, `ufw` allowing only 22/80/443.
3. **Clone the repo**, then create a real `.env.prod` (never commit this) with **freshly generated** secrets:
   ```bash
   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   POSTGRES_PASSWORD=<a strong random password>
   CORS_ORIGIN=https://yourdomain.com
   ```
   (`CLOUDINARY_*`/`TWILIO_*` can stay unset — the app already falls back to free local disk storage and no-op SMS logging when they're blank; `USE_CLOUD_STORAGE` defaults to `false`.)
4. **Build the images** from source (there's no public registry pull in this workflow yet):
   ```bash
   docker build -f Dockerfile.backend -t libmarket-backend:latest .
   docker build -f Dockerfile.frontend -t libmarket-frontend:latest .
   ```
5. **TLS**: run `certbot` for your domain, then uncomment/fill in the port-443 server block in `nginx.conf` with the issued cert paths, and rebuild the frontend image.
6. **Bring up the stack**:
   ```bash
   docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
   ```
7. **Run migrations** and create the real admin account:
   ```bash
   docker exec libmarket-backend-prod npm run migrate
   docker exec -it libmarket-backend-prod npm run create-admin
   ```
8. **Wipe any leftover test data** right before opening up to real users (keeps seeded categories/counties):
   ```bash
   docker exec libmarket-backend-prod npm run reset-for-launch -- --yes-really-wipe-prod-data
   ```

## Ongoing Deploys (after the first one)

```bash
docker build -f Dockerfile.backend -t libmarket-backend:latest .
docker build -f Dockerfile.frontend -t libmarket-frontend:latest .
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d db backend frontend
docker exec libmarket-backend-prod npm run migrate
```

## Data Persistence & Backups

`docker-compose.prod.yml` volumes:
- `db-data` — Postgres data
- `backend-uploads` — locally-stored product/avatar images (the free Cloudinary alternative)
- `db-backups` — automated daily `pg_dump` (gzipped, 14-day retention) written by the `backup` service, no extra setup needed

To restore from a backup: `gunzip -c /var/lib/docker/volumes/<...>/db-backups/<file>.sql.gz | docker exec -i libmarket-db-prod psql -U postgres -d libmarket`

## Troubleshooting

```bash
docker logs libmarket-backend-prod
docker logs libmarket-frontend-prod
docker exec libmarket-backend-prod curl http://localhost:5000/health
```
