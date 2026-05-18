# ChurnAi · Customer Churn Frontend

Frontend untuk proyek **Customer Churn Prediction** (Kelompok 1, Bina Nusantara 2026).

Stack: **React 18 + Vite + TypeScript + Tailwind CSS + Recharts + React Router**

---

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL if backend sudah ada
npm run dev
```

Buka `http://localhost:5173`. Tanpa backend, login/signup tetap bisa (auth masih in-memory), dan semua dashboard akan menampilkan **empty state yang clean** — siap di-fill begitu API live.

---

## Yang sudah dibuat

### Pages
- **`/login`** — Editorial split layout dengan dark hero
- **`/signup`** — Mirror style dari login, onboarding steps
- **`/`** (Overview) — KPI cards, prediction-volume area chart, risk-distribution histogram, top at-risk list — semua fetch dari API
- **`/customers`** — Tabel utama dengan filter (search nama/ID, churn % range, contract, internet, tenure, risk tier), sortable, klik baris → drawer detail
- **`/insights`** — Feature importance, churn rate per contract
- **`/settings`** — Profile & model config

### Components reusable
- `Wordmark`, `Sidebar`, `StatCard`, `RiskBadge`, `FilterBar`, `CustomerTable`, `CustomerDrawer`, `EmptyState`/`LoadingState`/`ErrorState`

### Data layer
- `src/types/index.ts` — Type mengikuti **21 kolom dataset Telco Customer Churn**
- `src/lib/api.ts` — API client stub, ready to call Express backend
- `src/hooks/useApi.ts` — Generic fetch hook dengan loading/error/refetch
- **Tidak ada mock data sama sekali** — semua page handle empty/loading/error states sendiri

---

## Integrasi backend

Frontend sudah siap untuk Express + Postgres + Flask ML service. Tinggal kasih response sesuai shape di `src/lib/api.ts`:

| Endpoint | Method | Returns |
|---|---|---|
| `/customers` | GET | `CustomerWithName[]` |
| `/customers/:id` | GET | `CustomerWithName` |
| `/overview` | GET | `OverviewStats` |
| `/predictions/history` | GET | `PredictionHistoryPoint[]` |
| `/predictions/distribution` | GET | `RiskDistributionBucket[]` |
| `/analytics/by-contract` | GET | `ContractAggregate[]` |

Set `VITE_API_URL` di `.env` ke URL backend Express.

**Auth (`src/context/AuthContext.tsx`)** — Masih in-memory. Saat backend siap, ganti `login()`/`signup()` dengan `fetch('${VITE_API_URL}/auth/...')`.

---

## Design notes

- **Typography**: Fraunces (display) + Geist (body) + JetBrains Mono (data/labels)
- **Palette**: bone (warm off-white) + ink (near-black) dengan accent ember/moss/rust
- **Aesthetic**: data-dense analytical, sharp corners, subtle grain overlay
- **Tidak pakai browser storage** (localStorage/sessionStorage) — semua state in-memory
