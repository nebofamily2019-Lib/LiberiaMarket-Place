# LibMarket Deployment Guide

## Deployment Options

### Option 1: Docker Compose (Recommended for Full Stack)

1. **Prerequisites:**
   - Docker and Docker Compose installed
   - Copy `.env.example` to `.env` and configure

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

3. **Access:**
   - Frontend: http://localhost:80
   - Backend: http://localhost:5000
   - Database: PostgreSQL on port 5432

### Option 2: Cloud Deployment (Railway + Vercel)

#### Backend on Railway

1. **Setup:**
   - Push code to GitHub
   - Connect Railway to your repository
   - Add PostgreSQL database service
   - Configure environment variables from `.env.example`

2. **Railway will automatically:**
   - Use `railway.toml` configuration
   - Build and deploy backend
   - Provide a public URL

#### Frontend on Vercel

1. **Setup:**
   - Connect Vercel to your repository
   - Set root directory to `frontend`
   - Configure environment variables:
     - `VITE_API_URL`: Your Railway backend URL + /api
     - Other vars from `frontend/.env.example`

2. **Vercel will automatically:**
   - Use `vercel.json` configuration
   - Build with Vite
   - Deploy to CDN

### Option 3: Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the dist folder with nginx or similar
```

## Environment Variables

### Backend Required Variables
- `NODE_ENV`: production
- `PORT`: 5000
- `DB_DIALECT`: postgres (for production)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random secret
- `FRONTEND_URL`: Your frontend URL

### Frontend Required Variables
- `VITE_API_URL`: Backend API URL with /api path
- `VITE_UPLOAD_URL`: Backend uploads URL

## Database Setup

### PostgreSQL (Production)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE libmarket_db;

# Run schema
\i database/schema.sql
\i database/messaging-schema.sql
```

### SQLite (Development)
SQLite database will be automatically created at `backend/database/libmarket.sqlite`

## Health Checks

- Backend: http://your-backend-url/health
- Frontend: http://your-frontend-url/

## Troubleshooting

### Backend Issues
- Check logs: `docker-compose logs backend`
- Verify database connection
- Ensure all environment variables are set

### Frontend Issues
- Verify `VITE_API_URL` points to backend
- Check browser console for errors
- Ensure CORS is configured correctly

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
