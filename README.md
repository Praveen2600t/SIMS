# Smart Inventory Continuous Monitoring System (SICMS)
### Simple All-In-One Inventory Surveillance, Batch Expiry & Alert System

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![React Router 7](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router)](https://reactrouter.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2F%20GitHub-black?logo=vercel)](https://vercel.com/)

---

## 1. Overview & Architecture

**SICMS** is an all-in-one **Smart Inventory Continuous Monitoring System** built with **Vite, React 19, TypeScript, Tailwind CSS, React Router, Recharts, and browser localStorage**.

It provides complete inventory control, batch lot expiry tracking, customer sales dispatch, vendor purchase orders, and continuous surveillance alarms—all running as a self-contained, standalone web application.

### Why this Architecture?
* **Zero External Server Dependencies:** Runs directly in any modern browser without needing Node backend servers, external databases, or paid APIs.
* **Instant Vercel Deployment:** Compiles to static web assets (`dist/`) in seconds.
* **Local Persistence:** All products, batches, stock movements, purchase orders, sales, and alerts persist in browser `localStorage`.
* **Sample Data Included:** Pre-loaded with realistic products across Electronics, Pharmaceuticals, Packaging, and Raw Materials. A **"Reset to Sample Data"** button lets you restore original demo data anytime.

---

## 2. Views & Feature Navigation

All views share a clean, responsive layout with a persistent sidebar, top navigation, active alert badges, and mobile drawer:

| Route | View Name | Description |
| :--- | :--- | :--- |
| `/` | **Dashboard** | Real-time KPI metrics, stock health gauge, automated surveillance alarms, and movement volume chart. |
| `/products` | **Product Catalogue** | Full CRUD for products, SKU management, safety stock thresholds, categories, search, filtering, and CSV export. |
| `/inventory` | **Stock Movements & Batches** | Stock In (+), Stock Out (-), Cycle Count Audits, Batch Expiry Tracker, and complete immutable movement ledger. |
| `/monitoring` | **Continuous Surveillance** | Automated alert rule engine (Low Stock, Depleted Zero Stock, Expired Lots, Upcoming 30-Day Expiry, Rapid Depletions) with acknowledge/resolve actions. |
| `/suppliers` | **Suppliers & Purchase Orders** | Manage authorized vendor details and issue POs; marking a PO as received automatically updates inventory balances. |
| `/sales` | **Sales & Revenue Tracking** | Record customer dispatches with automatic stock verification, invoice generation, payment methods, and revenue totals. |
| `/reports` | **Daily Stock Reports & Analytics** | Stock valuation summaries, inventory health breakdown, category valuation bars, and 60-day expiry watchlist. |
| `/csv-manager` | **CSV Dataset Manager** | Bulk-import inventory CSV files with column validation, error/duplicate detection, row preview, and sample template download. |

---

## 3. Continuous Surveillance Rules

The autonomous rule engine evaluates after every stock modification and whenever views open:

1. **Out of Stock (CRITICAL):** Triggers when product balance reaches `0`.
2. **Low Stock (WARNING):** Triggers when current stock falls at or below the product's `minStock` safety threshold.
3. **Expired Batch (CRITICAL):** Triggers when an active batch's expiration date is in the past.
4. **Near Expiry (WARNING):** Triggers when an active batch reaches its 30-day expiration window.
5. **Rapid Stock Depletion (INFO):** Detects single dispatches reducing previous stock by >50%.

---

## 4. Local Development

### Prerequisites
* Node.js 18+ installed

### Setup & Run
```bash
# 1. Clone repository
git clone https://github.com/Praveen2600t/SIMS.git
cd SIMS

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 5. Deployment Instructions

### Deploy to GitHub
```bash
git add -A
git commit -m "feat: complete all-in-one inventory surveillance system"
git push origin main
```

### Deploy to Vercel (1-Click)
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... > Project** and import your GitHub repository (`Praveen2600t/SIMS`).
3. Vercel automatically detects the Vite preset:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:** None required! (The app runs standalone with zero backend dependencies).
5. Click **Deploy**.

---

## 6. Data Storage & Privacy Note

All data modifications (products created, stock movements, batches, sales) are stored inside the browser's `localStorage`.
* Data remains on the device/browser where it was entered.
* Clicking **"Reset Sample Data"** in the sidebar restores the default catalog and transactions at any time.
