# Smart Inventory Intelligence System (SICMS)
### Continuous Monitoring & Operational Intelligence for Tamil Nadu Retail & Mandis

[![CI Pipeline](https://github.com/example/sicms/actions/workflows/ci.yml/badge.svg)](https://github.com/example/sicms/actions)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)

---

## 1. Executive Summary

**SICMS** is a production-grade inventory management and continuous surveillance platform focused on products, suppliers, and market locations in **Tamil Nadu, India**. 

It eliminates stockouts and inventory losses through real-time stock-level surveillance, batch-level shelf life tracking, transaction-level consistency guarantees, and explainable rule-based anomaly detection.

### Key Capabilities
* **Real-time Inventory Dashboard**: Live database metrics covering valuation, out-of-stock count, low stock threshold warnings, and regional market distribution across Tamil Nadu.
* **Continuous Monitoring Engine**: Evaluates `OUT_OF_STOCK`, `LOW_STOCK`, `EXPIRY_WARNING` (<= 7 days), and `EXPIRED` perishable batches, auto-resolving alerts when stock is replenished.
* **Explainable Anomaly Detection**: Flags unusual inventory drops (>40% drop without sales invoice) and rapid manual stock adjustments.
* **Transaction Consistency**: Atomic database transactions guarantee zero invalid negative stock, enforce batch deductions (FIFO), and preserve an audit log.
* **Procurement & Invoicing**: Supplier orders, expected delivery verification, and direct counter sales invoicing.
* **CSV Engine**: Download pre-seeded 220-item Tamil Nadu retail datasets or upload custom CSVs with duplicate detection and field validation.

---

## 2. Tamil Nadu Retail Dataset

The system includes a structured, repeatable dataset covering **10 core retail and food categories** across representative Tamil Nadu districts:

1. **Vegetables**: Ooty Carrot, Dindigul Country Tomato, Salem Big Onion, Tirunelveli Chilli, Perambalur Shallots, etc.
2. **Fruits**: Salem Malgova Mango, Trichy Poovan Banana, Theni Red Banana, Panruti Jackfruit, etc.
3. **Beverages**: Pollachi Tender Coconut, Nilgiris CTC Tea, Kumbakonam Degree Coffee, Bovonto Soda, Aavin Milk, etc.
4. **Fast-Food Ingredients**: Burger buns, pizza bases, mozzarella blocks, mayonnaise, French fries, patties, cooking oils.
5. **Grains & Staples**: Tanjore Ponni Rice, Seeraga Samba Rice, Sharbati Atta, Toor Dal, Urad Dal, Millets (Ragi, Varagu, Samai, Thinai).
6. **Dairy**: Aavin Fresh Milk, Curd Tubs, Pure Cow Ghee, Malai Paneer, Creamery Butter, Khoya.
7. **Bakery**: Bread, plum cakes, butter rusks, coconut macaroons, dry yeast, cocoa powder.
8. **Spices & Condiments**: Erode Turmeric, dry chilli powder, Malabar black pepper, cumin seeds, Tuticorin salt.
9. **Meat & Frozen**: Country chicken (Nattu Kozhi), broiler cuts, Rameshwaram seer fish (Vanjaram), frozen green peas.
10. **Grocery & Packaged**: Refined sugar, Tirunelveli palm jaggery (Karupatti), sesame oil, groundnut oil, appalam papads.

### District & Mandi Coverage
Representative markets include: **Chennai** (Koyambedu Wholesale Market, George Town), **Coimbatore** (MGR Mandi, RS Puram), **Madurai** (Mattuthavani), **Tiruchirappalli** (Gandhi Market), **Salem** (Shevapet), **Erode** (Nethaji Daily Market), **Dindigul** (Oddanchatram), **Nilgiris** (Ooty Municipal Market), and more.

---

## 3. Quick Start & Local Setup

### Prerequisites
* **Node.js** v20.x or v24.x
* **npm** v10+

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd SICMS
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Initialize the Database**:
   For local development, you can start Prisma's built-in Postgres server:
   ```bash
   npx prisma dev -d
   ```
   Push the schema to synchronize your database tables:
   ```bash
   npm run db:push
   ```

5. **Generate & Seed Tamil Nadu Dataset**:
   Seed pre-built users, suppliers, locations, 220 product records, batches, and initial alerts:
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Default Demo Credentials

Pre-seeded accounts are provided for instant evaluation:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@sicms.tn.gov.in` | `AdminPassword123!` |
| **Staff Member** | `staff@sicms.tn.gov.in` | `StaffPassword123!` |

*(Both accounts are accessible with one-click quick-fill buttons on the login screen).*

---

## 5. Automated Testing & Verification

The test suite validates inventory transactions, negative quantity prevention, monitoring alerts, and CSV imports using Vitest:

```bash
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch
```

To run a production build verification:
```bash
npm run build
```

---

## 6. Dataset Generation & CSV Import

To generate fresh or larger synthetic CSV datasets (e.g. 500 or 1,000 records):
```bash
# Generate default 220 records
npm run generate:dataset

# Generate 1,000 records
npx tsx scripts/generate-dataset.ts --count=1000
```
CSV files are stored in `public/data/tamilnadu_inventory_sample_200.csv` and can be imported or downloaded from the **CSV Manager** page (`/csv-manager`).

---

## 7. Deployment Instructions (GitHub & Vercel)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: Initial Smart Inventory Intelligence System (SICMS) release"
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel
1. Navigate to [Vercel](https://vercel.com/new) and import the repository.
2. Under **Environment Variables**, provide:
   * `DATABASE_URL`: Hosted PostgreSQL connection string (Supabase / Neon / AWS RDS). *Append `?pgbouncer=true` if using pooled connections.*
   * `JWT_SECRET`: Secure 32-character random string.
   * `NEXT_PUBLIC_APP_URL`: Your Vercel production domain.
   * `CRON_SECRET`: Secret token for monitoring scheduler.
3. Click **Deploy**.

---

## 8. Continuous Monitoring & Worker Scheduling

The continuous monitoring engine (`/api/monitoring/run`) evaluates rules across all active inventory.
* **On Vercel**: Handled automatically via `vercel.json` cron expressions.
* **External Cron**: Trigger with HTTP POST:
  ```bash
  curl -X POST https://your-domain.com/api/monitoring/run \
       -H "Authorization: Bearer <CRON_SECRET>"
  ```

---

## 9. License & Disclaimer
This software is developed for research and evaluation purposes. All market quotations, supplier contact information, and prices represent synthetic demo data for Tamil Nadu retail establishments.
