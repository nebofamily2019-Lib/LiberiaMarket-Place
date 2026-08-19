# Local Production Simulation Guide

This guide explains how to set up a "Production-like" environment on your local Windows machine. This allows you to test PostgreSQL and Cloudinary before deploying to Azure.

## 1. PostgreSQL Setup (Database)

Instead of using SQLite (file-based), we will use PostgreSQL (server-based), which is what Azure uses.

### Step 1: Install PostgreSQL
1.  Download the installer for Windows: [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2.  Run the installer.
3.  **Important**: Remember the password you set for the `postgres` superuser.
4.  Keep the default port `5432`.

### Step 2: Create the Database
1.  Open **pgAdmin 4** (installed with Postgres) or use the terminal.
2.  Create a new database named `libmarket_prod`.

### Step 3: Configure Backend
1.  Open `backend/.env`.
2.  Comment out the SQLite settings and uncomment/add the Postgres settings:

```dotenv
# DB_DIALECT=sqlite
# DB_STORAGE=./database.sqlite

DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=libmarket_prod
DB_USER=postgres
DB_PASSWORD=your_password_from_step_1
```

### Step 4: Run Migrations
Run this command in the `backend` terminal to create the tables:
```powershell
npx sequelize-cli db:migrate
```

---

## 2. Cloudinary Setup (Image Hosting)

Instead of saving images to the `uploads/` folder, we will send them to the Cloudinary CDN.

### Step 1: Get Credentials
1.  Sign up for a free account at [Cloudinary](https://cloudinary.com/).
2.  Go to your **Dashboard**.
3.  Copy the **Cloud Name**, **API Key**, and **API Secret**.

### Step 2: Configure Backend
1.  Open `backend/.env`.
2.  Add the following lines:

```dotenv
USE_CLOUD_STORAGE=true
CLOUDINARY_CLOUD_NAME=paste_your_cloud_name
CLOUDINARY_API_KEY=paste_your_api_key
CLOUDINARY_API_SECRET=paste_your_api_secret
```

### Step 3: Test
1.  Restart your backend server (`npm run dev`).
2.  Upload a product image.
3.  Check your Cloudinary Media Library to see if the image appears there.

---

## 3. Verify Everything
1.  Start the backend: `npm run dev`
2.  Start the frontend: `npm start`
3.  Create a new user (this tests Postgres).
4.  Create a new listing with a photo (this tests Cloudinary).

If both work, your application is **Platform-Agnostic** and ready for Azure!
