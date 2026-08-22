# LibMarket Docker & CI/CD Setup

## Overview

This project now includes production-ready Docker images with automated CI/CD pipelines for building and publishing versions to Docker Hub.

## Quick Start

### Local Development
For day-to-day development, run the frontend and backend natively (`npm run dev` in each of `frontend/` and `backend/`) — see the root `CLAUDE.md` for details. There is no separate Docker Compose file for local dev; `docker-compose.prod.yml` is the only compose file in this repo and it runs the production images.

### Production Deployment
```bash
# Set environment variables
export DOCKER_USERNAME=your-docker-username
export VERSION=v1.0.0
export POSTGRES_PASSWORD=your-postgres-password
export JWT_SECRET=your-jwt-secret

# Deploy with docker-compose.prod.yml (DB_* vars are derived from POSTGRES_* above)
docker compose -f docker-compose.prod.yml up -d
```

## Docker Images

### Backend (`Dockerfile.backend`)
- **Base**: Node.js 18-alpine
- **Features**:
  - Multi-stage build for optimized layers
  - Non-root user for security
  - Health check endpoint
  - Production environment variables
- **Build**: `docker build -f Dockerfile.backend -t libmarket-backend:v1.0.0 .`
- **Run**: `docker run -p 5000:5000 libmarket-backend:v1.0.0`

### Frontend (`Dockerfile.frontend`)
- **Base**: Node.js 18-alpine (build) → Nginx-alpine (production)
- **Features**:
  - Multi-stage build: Node for compilation, Nginx for serving
  - Optimized Nginx config
  - Non-root user for security
  - Health check via HTTP
- **Build**: `docker build -f Dockerfile.frontend -t libmarket-frontend:v1.0.0 .`
- **Run**: `docker run -p 80:80 libmarket-frontend:v1.0.0`

## CI/CD Pipeline (GitHub Actions)

**File**: `.github/workflows/docker-build-push.yml`

### Triggers
- **On tag push**: `git tag v1.0.0 && git push --tags`
- **On main branch push**: Automatic build (optional)
- **Manual trigger**: Use GitHub Actions UI with custom version

### Setup

1. **Create Docker Hub token**:
   - Log in to [Docker Hub](https://hub.docker.com)
   - Go to Account Settings → Security → New Access Token
   - Choose "Read & Write" permissions
   - Copy the token

2. **Add GitHub Secrets**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add:
     - `DOCKER_USERNAME`: Your Docker Hub username
     - `DOCKER_PASSWORD`: Your Docker Hub token

3. **Push a release**:
   ```bash
   git tag v1.0.0
   git push --tags
   ```

### What Happens
- Builds backend image: `yourusername/libmarket-backend:v1.0.0`
- Builds frontend image: `yourusername/libmarket-frontend:v1.0.0`
- Tags both with `:latest`
- Pushes to Docker Hub
- Creates GitHub Release with deployment instructions

## Versioning Strategy

Use **semantic versioning**:
- `v1.0.0` — First release
- `v1.0.1` — Patch (bug fixes)
- `v1.1.0` — Minor (new features, backward compatible)
- `v2.0.0` — Major (breaking changes)

### Release Workflow
```bash
# Increment version in package.json files (optional)
# Create and push tag
git tag v1.1.0
git push origin v1.1.0

# GitHub Actions automatically:
# - Builds images
# - Pushes to Docker Hub
# - Creates release notes
```

## Production Deployment

### Option 1: Docker Compose (Single Host)
```bash
# Create .env.prod file with production secrets
cat > .env.prod << EOF
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
EOF

# Deploy
VERSION=v1.0.0 docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

### Option 2: Kubernetes
```bash
# Images are compatible with Kubernetes deployments
# Use your registry: docker.io/yourusername/libmarket-backend:v1.0.0
```

### Option 3: Managed Services
- **Railway**: Connect GitHub repo, auto-deploys on tags
- **Heroku**: Migrate images to Heroku Container Registry
- **AWS ECS**: Push images to ECR, create ECS task definitions
- **Azure Container Instances**: Use Azure Container Registry

## Network & Data Persistence

**docker-compose.prod.yml** includes:
- **Shared network** (`libmarket-network`): Frontend, backend, and database communicate
- **Volumes**:
  - `db-data`: PostgreSQL data persistence
  - `backend-uploads`: Multer file uploads storage
- **Health checks**: All services monitor their own health

## Security Features

### Dockerfiles
- ✅ Non-root users (nodejs, nginx)
- ✅ Minimal base images (alpine)
- ✅ Multi-stage builds (reduced attack surface)
- ✅ Health checks for orchestration
- ✅ Read-only filesystem where possible

### Environment Secrets
- Never hardcode secrets in Dockerfiles
- Use `.env` files with `--env-file` flag
- GitHub Secrets for CI/CD
- Production secret management (AWS Secrets Manager, Azure KeyVault, etc.)

## Scaling Considerations

- **Frontend**: Stateless — scale horizontally with load balancer
- **Backend**: Stateless API — scale horizontally
- **Database**: Consider managed PostgreSQL (RDS, Azure Database, Cloud SQL)
- **File storage**: Move uploads to S3/Azure Blob/GCS for distributed deployments

## Troubleshooting

### Build fails
```bash
docker build --no-cache -f Dockerfile.backend .
```

### Container won't start
```bash
docker logs <container-id>
docker inspect <container-id>
```

### Health check failing
```bash
docker exec <container-id> /bin/sh
# Inside container, test endpoint manually
curl http://localhost:5000/health
```

## References
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions for Docker](https://github.com/docker/build-push-action)
- [Semantic Versioning](https://semver.org/)
