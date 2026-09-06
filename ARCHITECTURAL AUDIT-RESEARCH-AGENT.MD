# ARCHITECTURAL AUDIT & RESEARCH BRIEF: PRODUCTION ROADMAP

### Objective
Perform an architectural audit of our current Marketplace application stack, investigate open-source production deployment patterns, and formulate concrete recommendations for our production release.

---

### Phase 1: Current State Assessment (The Audit)
Document our existing implementation across these four domains:

1. **Host-to-Container Boundaries:**
   * Where does application runtime end and backing infrastructure begin?
   * Are development commands (`npm run dev`) tightly coupled to container rebuilds, or can developers iterate natively on the host?
2. **State & File Persistence:**
   * How are PostgreSQL data files mounted and backed up?
   * Where do listing media and profile uploads live? (Verify if they rely on local container disk, bind mounts, or an API-driven storage layer).
3. **Container Security & Footprint:**
   * Evaluate our `Dockerfile`: Does it compile in a single stage or multi-stage?
   * What is the uncompressed image footprint?
   * Does the container process run as `root` (UID 0) or an unprivileged user?
4. **Network Exposure & Secrets:**
   * Which container ports are directly mapped to the host (`0.0.0.0` vs `127.0.0.1` vs internal Docker networks)?
   * How are environment variables and runtime secrets ingested and isolated from version control?

---

### Phase 2: Technical Research & Comparative Analysis
Evaluate and benchmark 100% open-source solutions tailored to our target environment (self-hosted/sovereign Linux host, low bandwidth, intermittent connectivity):

#### 1. Ingress & Reverse Proxy Layer
Evaluate **Caddy** vs. **Nginx** vs. **Traefik**:
* Automated TLS / Let's Encrypt handling with zero external manual interventions.
* Reverse proxying WebSocket / HTTP traffic to the Node.js application container.
* Static asset caching performance (critical for reducing bandwidth on listing photos).

#### 2. Object & Media Storage
Evaluate **MinIO** vs. **Local Bind-Mounts with Nginx static serving**:
* S3 API compatibility (enabling seamless migration to decentralized or cloud S3 later without codebase rewrites).
* Resource consumption (RAM/CPU overhead on a single host).
* Built-in thumbnail/compression handling or integration with image processors (e.g., Sharp) to conserve mobile data for end users.

#### 3. Container Lifecycle & Service Orchestration
Evaluate **Docker Compose + Watchtower / Systemd** vs. **Lightweight Orchestration (K3s / Nomad)**:
* Automated container restart policies and system reboot recovery.
* Zero-downtime rolling updates on a single node.
* Operational simplicity: Minimize administrative overhead for an MVP.

#### 4. Backup & Disaster Recovery Pipeline
Evaluate open-source backup mechanisms (e.g., **pg_dump + restic / Litestream**):
* Automated, scheduled snapshots of the relational database and user uploads.
* Encrypted off-site replication to secondary storage over limited network connections.

---

### Phase 3: Deliverable & Recommendation Report
Deliver an **Architectural Decision Record (ADR)** covering:

1. **Gap Analysis:** Current architecture vs. Target production standard.
2. **Recommended Stack Selection:** Specific tooling recommendations for:
   * Edge/Reverse Proxy (e.g., Caddy vs. Nginx).
   * Object Storage (e.g., MinIO vs. alternatives).
   * Deployment/Lifecycle Management on a single Linux instance.
3. **Actionable Remediation Plan:**
   * Phase A: Changes required in the current repo (Dockerfile refactoring, Compose restructuring).
   * Phase B: Infrastructure setup script/playbook for the production server.
   * Phase C: Estimated operational overhead and hardware resource footprint (RAM/CPU/Disk).