# LibMarket Docker & Go-Live Guide

## Overview

LibMarket is deployed as self-hosted Docker containers (frontend/Caddy, backend/Node, Postgres, plus a backup sidecar) via `docker-compose.prod.yml` — no cloud PaaS (Render/Netlify/Railway/Vercel), no Kubernetes. This is the confirmed, single deployment target. CI (`.github/workflows/docker-build-push.yml`) only builds and pushes images to Docker Hub on a tag push — it does not deploy anything. Deploying is a manual step you run yourself, on whichever server you've chosen.

For local day-to-day development (no Docker), see `MANUAL-RUN.md` and the root `CLAUDE.md`.

## Docker Images

### Backend (`Dockerfile.backend`)
- **Base**: `node:22-alpine`
- Multi-stage build (separate `dependencies` stage for native modules), production `npm install --production`
- Build: `docker build -f Dockerfile.backend -t libmarket-backend:latest .`

### Frontend (`Dockerfile.frontend`)
- **Base**: `node:22-alpine` (build) → `caddy:2-alpine` (serve)
- Caddy proxies `/api` and `/uploads` to the backend container and automatically obtains/renews a Let's Encrypt certificate for whatever domain you set (see `Caddyfile`) — no certbot, no manual renewal
- Build: `docker build -f Dockerfile.frontend -t libmarket-frontend:latest .`

## First-Time Go-Live Steps (on a fresh VPS)

1. **Provision a server**: any Linux VPS with Docker + Docker Compose installed (DigitalOcean/Hetzner/Linode droplet, ~$6-12/mo — no proprietary lock-in). Point a domain's A record at its IP.
2. **Harden it**: SSH key-only auth, `ufw` allowing only 22/80/443.
3. **Clone the repo**, then create a real `.env.prod` (never commit this) with **freshly generated** secrets:
   ```bash
   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   POSTGRES_PASSWORD=<a strong random password>
   CORS_ORIGIN=https://yourdomain.com
   DOMAIN=yourdomain.com
   ACME_EMAIL=you@yourdomain.com
   ```
   (`CLOUDINARY_*`/`TWILIO_*` can stay unset — the app already falls back to free local disk storage and no-op SMS logging when they're blank; `USE_CLOUD_STORAGE` defaults to `false`. `DOMAIN`/`ACME_EMAIL` can also stay unset for a first local smoke-test — Caddy just serves plain HTTP on `localhost` until you point a real domain at it.)
4. **Build the images** from source (there's no public registry pull in this workflow yet):
   ```bash
   docker build -f Dockerfile.backend -t libmarket-backend:latest .
   docker build -f Dockerfile.frontend -t libmarket-frontend:latest .
   ```
5. **TLS**: nothing to do here — point your domain's A record at the server and set `DOMAIN`/`ACME_EMAIL` in `.env.prod` (step 3). Caddy issues and renews the certificate itself the first time it starts with a real domain, and keeps it in the `caddy-data` volume across restarts.
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

## One-Time Migration: Backend Now Runs as Non-Root

`Dockerfile.backend` now drops to an unprivileged `node` user before running the app (see `ARCHITECTURE-DECISION-RECORD.md`). If you already have a running deployment, its `backend-uploads` volume was created back when the container ran as root, so its files are still root-owned on disk — Docker only inherits ownership into a *fresh* volume, not an existing one. Fix it once, before deploying the new image, or new uploads will fail with permission errors:

```bash
docker run --rm -v libmarket_backend-uploads:/data alpine chown -R 1000:1000 /data
```

(Adjust the volume name if `docker volume ls` shows a different prefix than `libmarket_`.) Skip this entirely on a brand-new deployment — the volume doesn't exist yet, so it'll be created with the right ownership from the start.

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
- `caddy-data` / `caddy-config` — Caddy's TLS certificates and ACME account state. **Never delete these on a live domain** — losing them means Caddy re-requests a certificate from Let's Encrypt, and repeated re-issuance can hit [Let's Encrypt's rate limits](https://letsencrypt.org/docs/rate-limits/).

To restore from a local backup: `gunzip -c /var/lib/docker/volumes/<...>/db-backups/<file>.sql.gz | docker exec -i libmarket-db-prod psql -U postgres -d libmarket`

### Off-site backups (optional, recommended)

By default, backups are DB-only and never leave the host — fine for a first deploy, but a disk/VPS failure loses everything at once. To also back up the `backend-uploads` volume and push both off-site, encrypted, via [restic](https://restic.net/):

1. Create a [Backblaze B2](https://www.backblaze.com/cloud-storage) bucket (or any restic-supported destination) and an application key.
2. Add to `.env.prod`:
   ```bash
   RESTIC_REPOSITORY=b2:your-bucket-name:libmarket
   RESTIC_PASSWORD=<a strong random passphrase — losing this makes backups unrecoverable, store it somewhere safe outside the server>
   B2_ACCOUNT_ID=<your B2 key ID>
   B2_ACCOUNT_KEY=<your B2 application key>
   ```
3. Redeploy the `backup` service (`docker compose --env-file .env.prod -f docker-compose.prod.yml up -d backup`). It auto-initializes the restic repository on first run, then pushes both the nightly `pg_dump` and the uploads volume off-site after each local backup, pruning to 14 daily / 8 weekly snapshots.

Leaving `RESTIC_REPOSITORY` unset skips all of this — the service falls back to exactly its original local-only behavior.

To restore uploads from restic: `docker run --rm -e RESTIC_REPOSITORY -e RESTIC_PASSWORD -e B2_ACCOUNT_ID -e B2_ACCOUNT_KEY -v backend-uploads:/restore restic/restic restore latest --target /restore`

## Troubleshooting

```bash
docker logs libmarket-backend-prod
docker logs libmarket-frontend-prod
docker exec libmarket-backend-prod curl http://localhost:5000/health
```
