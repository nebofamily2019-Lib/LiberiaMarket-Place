# Phase 1: VPS & Domain Setup

Infrastructure steps to get a real server ready, before the app-level steps in `DOCKER-DEPLOYMENT.md`. No sysadmin background assumed — every command is copy-paste ready. Do this once, for the initial go-live.

## 1. Pick a VPS provider

| Provider | Smallest viable droplet (1-2GB RAM) | Regions near West Africa | Ease of setup |
|---|---|---|---|
| **DigitalOcean** (recommended) | ~$6-12/mo, flat rate | No African region, but their European (Amsterdam/London) and US-East droplets have reasonable latency to Liberia; simple global anycast-style routing | Easiest — best docs, one-click Ubuntu image, simple dashboard |
| Linode (Akamai) | ~$5-12/mo, flat rate | No African region either; similar latency profile to DO | Similar ease, slightly less polished UI |
| Hetzner | ~€4-8/mo, cheapest | EU-only (Germany/Finland) — likely *higher* latency to Liberia than DO/Linode's options | Cheapest but German-language support/docs occasionally |

**Recommendation: DigitalOcean.** None of the three has a West Africa datacenter, so raw latency differences between them are minor for a mobile-first app where users mostly aren't doing latency-sensitive real-time work. DO wins on documentation quality and ease of first-time setup, which matters more here. Pick the cheapest droplet with **1GB RAM / 1 vCPU** to start (~$6/mo) — this app is lightweight; you can resize later without downtime if traffic grows. Choose **Ubuntu 24.04 LTS** as the image.

## 2. Buy a domain

Use **Namecheap** or **Porkbun** — both are cheap (~$10-15/yr for a `.com`), no forced paid add-ons at checkout (decline upsells like "premium DNS" or "WHOIS privacy" if priced extra — Porkbun includes WHOIS privacy free).

Once you have the domain and the VPS's public IP address (shown in your provider's dashboard after creating the droplet):
1. In your registrar's DNS settings, add an **A record**: Host `@` (or blank, for the root domain) → Value = your VPS's IP address.
2. Optionally add another A record: Host `www` → same IP, if you want `www.yourdomain.com` to work too.
3. DNS changes can take a few minutes to a few hours to propagate. Check with `ping yourdomain.com` from your own machine — once it returns the VPS's IP, you're ready.

## 3. First login & basic hardening

SSH into the server as `root` using the password/key your provider emailed you:
```bash
ssh root@YOUR_SERVER_IP
```

Create a non-root user with sudo access (replace `libmarket` with any username you like):
```bash
adduser libmarket
usermod -aG sudo libmarket
```

Copy your SSH key to the new user so you can log in without a password:
```bash
rsync --archive --chown=libmarket:libmarket ~/.ssh /home/libmarket
```
(If you don't have an SSH key pair yet, run `ssh-keygen` on your **own machine** first, then re-run the command above from a fresh root session, or use `ssh-copy-id libmarket@YOUR_SERVER_IP` after setting a temporary password with `passwd libmarket`.)

Log out and back in as the new user to confirm it works:
```bash
exit
ssh libmarket@YOUR_SERVER_IP
```

Now lock down root/password login. Edit `/etc/ssh/sshd_config`:
```bash
sudo nano /etc/ssh/sshd_config
```
Find and set:
```
PermitRootLogin no
PasswordAuthentication no
```
Save (Ctrl+O, Enter, Ctrl+X), then restart SSH:
```bash
sudo systemctl restart ssh
```

Set up the firewall — allow only SSH, HTTP, and HTTPS:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```
(Type `y` to confirm.)

## 4. Install Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```
Log out and back in again for the group change to take effect (`exit`, then SSH back in). Confirm it worked:
```bash
docker --version
docker compose version
```

Make sure Docker survives a reboot:
```bash
sudo systemctl enable docker
```

## 5. Get the code onto the server

Clone the repo (you'll need it accessible to this server — either a public repo, or set up a deploy key/personal access token for a private one):
```bash
git clone <your-repo-url> libmarket
cd libmarket
```

Create the real production secrets file **directly on the server** (never copy your local dev one):
```bash
cat > .env.prod << 'EOF'
JWT_SECRET=REPLACE_ME
POSTGRES_PASSWORD=REPLACE_ME
CORS_ORIGIN=https://yourdomain.com
EOF
```
Generate the two `REPLACE_ME` values and edit them in:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   # → JWT_SECRET
openssl rand -base64 24                                                     # → POSTGRES_PASSWORD
nano .env.prod
```

## 6. TLS certificate (automatic, via Caddy)

Nothing to install or run on the host. The frontend container runs Caddy, which obtains and renews its own Let's Encrypt certificate automatically the first time it starts up with a real domain — no certbot, no manual cert paths, no renewal cron.

Just set these two values in `.env.prod` (step 5) before bringing the stack up:
```bash
DOMAIN=yourdomain.com
ACME_EMAIL=you@yourdomain.com
```

Then follow `DOCKER-DEPLOYMENT.md`'s "First-Time Go-Live Steps" starting at step 4 (build images) — port 443 and the certificate storage volume are already wired up in `docker-compose.prod.yml`. Caddy keeps the certificate in the `caddy-data` volume, so it survives container restarts/redeploys and won't be re-requested (and won't risk hitting Let's Encrypt's rate limits) unless that volume is deleted.

## 7. Surviving a reboot

Every service in `docker-compose.prod.yml` (frontend, backend, db, backup) already has `restart: always` set, so if the server reboots, Docker will bring all your containers back up automatically — as long as Docker itself is running, which step 4's `systemctl enable docker` already ensures. Nothing else to configure here.

---

You're ready for the app-level steps — continue with `DOCKER-DEPLOYMENT.md`'s "First-Time Go-Live Steps," starting from building the Docker images.
