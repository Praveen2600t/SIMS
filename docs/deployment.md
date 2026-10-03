# Smart Inventory Continuous Monitoring System (SICMS)
## Vite + React + TypeScript Deployment Guide (GitHub & Vercel)

This project has been converted from Next.js to **Vite + React 19 + TypeScript + React Router**, running with **Vercel Serverless Functions** for backend API endpoints and cron jobs, backed by **Supabase PostgreSQL** via Prisma.

---

## 1. Architecture Overview

- **Frontend:** Vite SPA built to `dist/`, served with client-side SPA routing (`react-router-dom`).
- **Backend APIs:** Vercel Functions in `api/index.ts` routing to standard service handlers (`src/server/apiRouter.ts`).
- **Database:** Supabase PostgreSQL connected via Prisma Client (`DATABASE_URL`).
- **Scheduled Monitoring:** Vercel Cron at `/api/monitoring/run` running daily at `0 0 * * *` (100% Hobby plan compatible).
- **Real-Time Monitoring:** Triggered automatically through the backend on every stock-in, stock-out, and stock adjustment transaction.

---

## 2. Prerequisites

1. **GitHub Account:** To host the repository.
2. **Vercel Account:** Free Hobby tier is fully supported (12 serverless functions limit, 1 daily cron limit).
3. **Supabase Project:** Free tier managed PostgreSQL database.

---

## 3. Supabase Database Configuration

1. In your **Supabase Dashboard**, open your project.
2. Go to **Project Settings** -> **Database**.
3. Under **Connection string**, select **Transaction** (port 6543) or **Session** (port 5432).
4. Copy the connection URI:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Apply the Prisma schema and seed initial multi-sector records:
   ```bash
   # Push schema to Supabase
   npx prisma db push

   # Seed initial baseline data (users, categories, suppliers, warehouse zones, products, batches)
   npm run db:seed
   ```

---

## 4. GitHub Push Instructions

Initialize and push your repository to GitHub:

```bash
# Verify git status
git status

# Stage all files
git add .

# Commit changes
git commit -m "feat: convert frontend to Vite + React Router and configure Vercel deployment"

# Link to your remote GitHub repository
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push to main
git branch -M main
git push -u origin main
```

---

## 5. Vercel Deployment Configuration

1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
2. Select your imported GitHub repository.
3. Configure **Build and Output Settings**:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Expand **Environment Variables** and enter:
   - `DATABASE_URL`: Your Supabase connection string with `?pgbouncer=true`.
   - `JWT_SECRET`: A secure random string (minimum 32 characters).
   - `CRON_SECRET`: A secret token for the automated continuous surveillance engine.
   - `VITE_APP_URL` (optional): The public URL of your Vercel deployment (e.g. `https://sicms.vercel.app`).
5. Click **"Deploy"**.

---

## 6. SPA Routing & Vercel Cron Configuration (`vercel.json`)

The included [`vercel.json`](file:///c:/Users/Pc/Documents/SICMS/vercel.json) handles SPA routing rewrites and Vercel Hobby-compatible crons:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/monitoring/run",
      "destination": "/api/monitoring/run"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "crons": [
    {
      "path": "/api/monitoring/run",
      "schedule": "0 0 * * *"
    }
  ]
}
```

- **SPA Rewrites:** All frontend page refreshes (`/dashboard`, `/products`, `/monitoring`, etc.) rewrite to `/index.html` preventing 404 errors.
- **Serverless API:** All `/api/*` routes are handled by the serverless function router at `api/index.ts`.
- **Scheduled Cron:** Vercel automatically runs the continuous surveillance check at midnight UTC every day.

---

## 7. Pre-Seeded Demonstration Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@sicms.io` | `AdminPassword123!` |
| **Supervisor** | `supervisor@sicms.io` | `SupervisorPassword123!` |
| **Operator / Staff** | `staff@sicms.io` | `StaffPassword123!` |
