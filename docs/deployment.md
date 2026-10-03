# Deployment & Production Setup Guide

## 1. Prerequisites
* Node.js v20+ or v24
* npm v10+
* Hosted PostgreSQL instance (Neon, Supabase, AWS RDS, or Render)

---

## 2. Environment Variables Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Set the variables:
* `DATABASE_URL`: Connection string to your hosted PostgreSQL database. If using a connection pooler like PgBouncer, append `?pgbouncer=true`.
* `JWT_SECRET`: Random 32+ character string for token signing.
* `NEXT_PUBLIC_APP_URL`: Production URL (e.g., `https://sicms.vercel.app`).
* `CRON_SECRET`: Secret token for scheduled continuous monitoring triggers.

---

## 3. Database Migration & Seeding
Push the schema to your hosted PostgreSQL database:
```bash
npm run db:push
```

Seed the multi-sector general inventory dataset (200 records across 10 categories, users, suppliers, warehouse zones, movements, and alerts):
```bash
npm run db:seed
```

---

## 4. Deploying to Vercel
1. Push the code repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   * `DATABASE_URL`
   * `JWT_SECRET`
   * `NEXT_PUBLIC_APP_URL`
   * `CRON_SECRET`
5. Click **Deploy**.

### Scheduled Monitoring on Vercel
The included `vercel.json` configures a cron job that triggers `/api/monitoring/run` automatically every 4 hours.
Alternatively, use an external scheduler (e.g. GitHub Actions or Cron-job.org) with header:
`Authorization: Bearer <CRON_SECRET>`

---

## 5. Production Pre-seeded User Accounts
* **Administrator**: `admin@sicms.io` (Password: `Admin@12345`)
* **Inventory Officer**: `staff@sicms.io` (Password: `Staff@12345`)
