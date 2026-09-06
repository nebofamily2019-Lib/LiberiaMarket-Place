# ADR: Production Infrastructure Stack (Self-Hosted, Single VPS)

Written in response to `ARCHITECTURAL AUDIT-RESEARCH-AGENT.MD`. Scope: audit current deployment architecture, evaluate open-source alternatives, and produce a concrete remediation plan — biased throughout for the actual target environment: **one 1GB RAM / 1 vCPU VPS, solo operator, low-bandwidth end users** (per `GO-LIVE-PHASE1-VPS-SETUP.md`'s confirmed sizing). Every recommendation below is weighed against that constraint, not against what a well-resourced team would run.

---

## Phase 1: Current State Audit

**1. Host-to-container boundaries.** Dev bind-mounts `backend/src` and `frontend/src` into the containers with `nodemon`/Vite hot-reload (`docker-compose.dev.yml`) — no rebuild needed for source edits. Prod (`docker-compose.prod.yml`) runs fully baked images with no host coupling beyond Docker itself. Clean separation, nothing to fix here.

**2. State & persistence.** Postgres data lives in the `db-data` named volume; uploads in `backend-uploads`, bind-mounted into the backend container at `/app/uploads` (`backend/src/middleware/upload.js` writes there directly via `multer.diskStorage`). Cloudinary is an optional fallback gated by `USE_CLOUD_STORAGE`. A `backup` sidecar already runs nightly `pg_dump` + gzip with 14-day retention into a `db-backups` volume.
   - **Gap**: backups are DB-only — the `backend-uploads` volume (actual product/avatar images) is never backed up at all.
   - **Gap**: backups never leave the host. They sit in a Docker volume on the same disk as the data they're backing up — a VPS/disk failure destroys both simultaneously.

**3. Container security & footprint.** `Dockerfile.frontend` is multi-stage and correctly drops to the built-in non-root `nginx` user before serving. `Dockerfile.backend` is also multi-stage (separate dependency-install stage for native modules like `sharp`/`sqlite3`) but its final stage has **no `USER` directive** — it runs as root (UID 0) inside the container.
   - **Gap**: backend container runs as root.

**4. Network exposure & secrets.** `docker-compose.prod.yml` maps the backend's port 5000 directly to the host (`0.0.0.0:5000:5000`) *in addition to* nginx already reverse-proxying `/api` and `/uploads` to it over the internal `libmarket-network`. Postgres has no host port mapping in prod (correct — internal-only). Secrets (`JWT_SECRET`, `POSTGRES_PASSWORD`, Cloudinary/Twilio keys) are injected via `${VAR}` substitution from an untracked `.env.prod` — correct pattern, nothing to fix there. TLS is entirely manual: `DOCKER-DEPLOYMENT.md` step 5 has the operator run `certbot` by hand and uncomment/fill a commented-out `server { listen 443 }` block in `nginx.conf`, with no automated renewal (no cron/systemd timer for `certbot renew` is set up anywhere in the repo).
   - **Gap**: backend port needlessly exposed directly to the host.
   - **Gap**: TLS issuance and renewal are fully manual, one-time, undocumented-for-renewal steps.

---

## Phase 2: Technology Comparison

### Reverse proxy — Caddy vs. Nginx vs. Traefik
Caddy obtains and renews Let's Encrypt certificates automatically with zero extra moving parts, in a single ~20-40MB-idle static binary — it would directly eliminate the manual certbot step and the renewal gap found above. Nginx (current) is equally lightweight but leaves TLS lifecycle entirely to the operator. Traefik is built for many dynamic backends/Kubernetes-style service discovery; for two static services (frontend + backend) it's added complexity and memory for no functional gain here.
**Recommendation: replace Nginx with Caddy — implemented.** `nginx.conf` is gone; `Dockerfile.frontend` now builds on `caddy:2-alpine` and reads its config from the new `Caddyfile`. One honest tradeoff accepted in exchange: the official Caddy image runs as **root** (it needs that to bind ports 80/443 and manage its own certificate storage), whereas the nginx image it replaces ran as an unprivileged user. A non-root Caddy setup is possible (internal high ports + Docker port remapping) but adds real config complexity I couldn't validate with a live build in this pass — see "Not yet validated" below. Revisit if this container's hardening becomes a priority beyond what's here.

### Object storage — MinIO vs. local bind-mount
MinIO is S3-API-compatible with a clean future migration path, but it's itself a stateful service demanding its own RAM/CPU/disk and its own backup story — real overhead on a 1GB droplet for an MVP with a handful of active sellers. The current local-bind-mount-with-Cloudinary-fallback approach costs nothing extra and is already swappable behind the `USE_CLOUD_STORAGE` flag.
**Recommendation: keep the current approach.** Revisit MinIO once upload volume actually justifies dedicating RAM to it. The more urgent problem isn't the storage backend — it's that the uploads volume isn't backed up at all (see Backup, below).

### Lifecycle/orchestration — Compose+Watchtower vs. K3s/Nomad
K3s/Nomad are built for multi-node and rolling-update scenarios; their control-plane overhead alone competes with the app itself for RAM on a single 1GB node — disproportionate for this scale. Within Compose, Watchtower would auto-pull new image tags and restart containers, removing the manual SSH-and-redeploy step in `DOCKER-DEPLOYMENT.md`'s "Ongoing Deploys" section — but it requires mounting the Docker socket into the Watchtower container, a real privilege-escalation surface if that container is ever compromised.
**Recommendation: stay on Compose.** Given the socket-exposure tradeoff, prefer keeping deploys as an explicit manual/scripted SSH step over adding Watchtower, unless hands-off auto-deploy is worth accepting that risk — this is a judgment call the user should make explicitly rather than one this ADR decides unilaterally.

### Backup/DR — restic vs. Litestream
Litestream is built for continuous SQLite replication — not applicable here (prod runs Postgres). restic does encrypted, deduplicated, incremental backups to a wide range of destinations (S3-compatible, Backblaze B2, SFTP), and can cover both the Postgres dump and the uploads directory in one job.
**Recommendation: extend the existing `backup` service with restic — wired in, opt-in.** The `backup` service now installs restic and, *only if* `RESTIC_REPOSITORY` is set in `.env.prod`, initializes the repo on first run and pushes both the nightly `pg_dump` and the `backend-uploads` volume off-site after each local backup (14 daily / 8 weekly retention). Leave `RESTIC_REPOSITORY` unset and it behaves exactly as before — local-only. Backblaze B2 is a good open/cheap fit (S3-compatible, first 10GB free, ~$6/TB/month after) and is what the wiring targets natively; see `DOCKER-DEPLOYMENT.md` for the setup steps. **I can't create the B2 bucket/key myself** — that's the one step still on you before this actually starts backing up off-site.

---

## Phase 3: Remediation Plan

### Phase A — repo changes

**Done, this pass:**
- Non-root `USER` added to `Dockerfile.backend`.
- Backend's direct host port mapping removed from `docker-compose.prod.yml` (nginx/Caddy already reach it over the internal Docker network — the host mapping was needless attack surface).
- Nginx → Caddy swap: `nginx.conf` removed, `Caddyfile` added, `Dockerfile.frontend` rebuilt on `caddy:2-alpine`, `docker-compose.prod.yml` updated with port 443 and the `caddy-data`/`caddy-config` volumes, CI's stale `NGINX_VERSION` build-arg fixed to `CADDY_VERSION`. `DOCKER-DEPLOYMENT.md` and `GO-LIVE-PHASE1-VPS-SETUP.md` updated to drop the certbot steps entirely.
- restic wired into the `backup` service, opt-in via `RESTIC_REPOSITORY` — see Backup/DR above.

**Not yet validated:** Docker Desktop was paused in this environment, so none of the above was verified with a real `docker build`/`docker compose up`. I traced the permission chain and Caddyfile syntax by hand (multer's upload dir, winston's log dir, the existing-volume ownership gotcha below, Caddy directive syntax against its documented behavior), but this is exactly the kind of change that deserves an actual build-and-boot smoke test before it touches the live server. **Do that first**, on a non-production host if possible, before deploying this to the real VPS.

**Still needs your decision:**
- Whether to add Watchtower, given the Docker-socket tradeoff discussed above — not implemented either way; deploys still work exactly as documented in `DOCKER-DEPLOYMENT.md`'s "Ongoing Deploys" section.

### Phase B — production server setup
- TLS: `GO-LIVE-PHASE1-VPS-SETUP.md`'s TLS section now just says "point your domain at the server and set `DOMAIN`/`ACME_EMAIL`" — done.
- Off-site backups: you still need to create the B2 bucket + application key yourself and add it to `.env.prod` (`DOCKER-DEPLOYMENT.md` has the exact steps) — the wiring is ready and waiting for those credentials.
- **Migration note for the already-live deployment**: the `backend-uploads` volume predates the non-root backend change and is still root-owned on disk — `DOCKER-DEPLOYMENT.md` has the one-time `chown` command to run before deploying the new backend image, or uploads will start failing.

### Phase C — resource footprint estimate
- Current stack (nginx + node + postgres + backup sidecar) on 1GB/1vCPU: workable but tight — no headroom to also run MinIO or a K3s control plane.
- Caddy in place of Nginx: roughly neutral-to-lower idle RAM (no certbot process/cron needed at all).
- Adding a restic backup step: negligible idle RAM — it runs briefly on the existing nightly schedule, not resident.
- **Net: the current single 1GB droplet remains adequate after every change recommended here.** No upsizing required.
