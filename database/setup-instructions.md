# PostgreSQL Setup Instructions for LibMarket

## Prerequisites
- PostgreSQL installed on Windows (download from https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
- pgAdmin 4 (included with PostgreSQL installer)

## Installation Steps

### 1. Install PostgreSQL
After downloading the installer from the link provided earlier:
1. Run the installer
2. Choose installation directory (default: `C:\Program Files\PostgreSQL\17`)
3. Select all components (PostgreSQL Server, pgAdmin 4, Command Line Tools)
4. Set password for the `postgres` superuser (remember this password!)
5. Use default port: `5432`
6. Use default locale

### 2. Verify Installation
Open Command Prompt or PowerShell and run:
```bash
psql --version
```

If not found, add PostgreSQL to your PATH:
- Add `C:\Program Files\PostgreSQL\17\bin` to your system PATH
- Restart your terminal

### 3. Create Database

#### Option A: Using pgAdmin (GUI)
1. Open pgAdmin 4
2. Connect to your PostgreSQL server (password: the one you set during installation)
3. Right-click "Databases" → "Create" → "Database"
4. Database name: `libmarket_db`
5. Owner: `postgres`
6. Click "Save"

#### Option B: Using Command Line (psql)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE libmarket_db;

# Exit psql
\q
```

### 4. Run Database Schema

#### Option A: Using pgAdmin (GUI)
1. In pgAdmin, select the `libmarket_db` database
2. Click "Query Tool" icon (or press F5)
3. Open the file `database/schema.sql`
4. Click "Execute/Refresh" (F5) to run the script

#### Option B: Using Command Line (psql)
```bash
# Navigate to your project directory
cd C:\Users\Maeyen\CommunityE-commerce-SPA-Liberia

# Run the schema file
psql -U postgres -d libmarket_db -f database/schema.sql
```

### 5. Configure Backend Environment

The `.env` file in the backend directory has been configured with these settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=libmarket_db
DB_USER=postgres
DB_PASSWORD=postgres
```

**IMPORTANT:** Update `DB_PASSWORD` in `backend/.env` to match the password you set during PostgreSQL installation.

### 6. Test Database Connection

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not done already)
npm install

# Start the backend server
npm run dev
```

You should see:
```
✅ Database connection established successfully.
🔄 Database synced successfully (development mode)
```

## Default Admin Account

After running the schema, a default admin account is created:
- **Email:** admin@libmarket.com
- **Password:** admin123

**Change this password immediately after first login!**

## Database Structure

The database includes the following tables:
- **Users** - User accounts and authentication
- **Categories** - Product categories (pre-populated with 8 default categories)
- **Products** - Product listings
- **Ratings** - User ratings and reviews

## Troubleshooting

### "psql: command not found"
Add PostgreSQL bin directory to your PATH:
1. Search "Environment Variables" in Windows
2. Edit "System Variables" → "Path"
3. Add `C:\Program Files\PostgreSQL\17\bin`
4. Restart terminal

### "password authentication failed"
Make sure the password in `backend/.env` matches your PostgreSQL password.

### Connection refused
Verify PostgreSQL service is running:
1. Open Services (services.msc)
2. Find "postgresql-x64-17" service
3. Make sure it's running

### Port already in use
If port 5432 is already in use, you can:
1. Change PostgreSQL port in pgAdmin (Server Properties → Connection → Port)
2. Update `DB_PORT` in `backend/.env` to match

## Next Steps

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `cd frontend && npm run dev`
3. **Access Application:** http://localhost:5173
4. **Access API:** http://localhost:5000

## PostgreSQL Management

### Using pgAdmin
- View tables: Navigate to `libmarket_db` → Schemas → public → Tables
- Query data: Right-click table → View/Edit Data
- Run queries: Click "Query Tool" icon

### Using Command Line
```bash
# Connect to database
psql -U postgres -d libmarket_db

# List tables
\dt

# Describe table structure
\d "Users"

# Query data
SELECT * FROM "Users";

# Exit
\q
```

## Backup and Restore

### Backup
```bash
pg_dump -U postgres -d libmarket_db -f backup.sql
```

### Restore
```bash
psql -U postgres -d libmarket_db -f backup.sql
```