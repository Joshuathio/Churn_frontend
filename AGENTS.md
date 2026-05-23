# Retentio Frontend Rules

This is the React frontend for Retentio/ChurnAi, a churn prediction CRM for telco customers.

The Express backend is in:

```txt
../churn-prediction-backend
```

The frontend must talk only to the Express backend, never directly to Flask or PostgreSQL.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React icons

## Key Files

- `src/lib/api.ts`: backend API client and shared frontend API response types.
- `src/types/index.ts`: domain types shared across UI components.
- `src/context/AuthContext.tsx`: BetterAuth email/password session integration.
- `src/pages/CustomersPage.tsx`: customer list, filters, pagination, create/edit/delete wiring.
- `src/components/CustomerForm.tsx`: customer create/edit form drawer.
- `src/components/CustomerDrawer.tsx`: customer detail drawer.
- `src/components/ConfirmDialog.tsx`: delete confirmation dialog.

## Authentication

Auth uses BetterAuth through the Express backend.

Current endpoints called by `AuthContext`:

- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-up/email`
- `GET /api/auth/get-session`
- `POST /api/auth/sign-out`

All API requests that require auth must send cookies:

```ts
credentials: 'include'
```

Do not implement OAuth login in this frontend unless the backend is explicitly changed.

## API Contract

Backend API base URL:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? '/api'
```

Vite dev server proxies `/api` to `http://localhost:8000`.

Customer endpoints:

- `GET /customers`
- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `DELETE /customers/:id`

Dashboard/analytics endpoints:

- `GET /overview`
- `GET /predictions/history`
- `GET /predictions/distribution`
- `GET /analytics/by-contract`

`GET /customers` returns paginated data:

```ts
{
  msg: 'success',
  data: CustomerWithName[],
  meta: {
    page: number
    limit: number
    totalRecords: number
    totalPages: number
  }
}
```

Single customer reads, create, and update return raw `CustomerWithName`.

Delete returns:

```ts
{ ok: true }
```

Keep `src/lib/api.ts` in sync with backend response shapes.

## Customer CRUD UX

Do not create a separate page for customer creation unless explicitly requested.

Use the existing Customers page workflow:

- `Create customer` button opens `CustomerForm` with `initial = null`.
- Customer row click opens `CustomerDrawer`.
- `CustomerDrawer` has edit/delete actions.
- Edit opens `CustomerForm` with the selected customer as `initial`.
- Delete uses `ConfirmDialog`.
- After create/update/delete, refetch the paginated customer list.

The frontend only sends customer feature fields. It must not send model-owned fields:

- `customerID`
- `churnProbability`
- `riskLevel`
- `riskFactors`
- `lastUpdated`
- `lastPredictedAt`
- `predictionStatus`
- `predictionError`

The backend/model owns prediction values.

## Customer Pagination And Filters

Customers page uses backend pagination and filtering.

Do not filter only the current page locally for customer directory filters.

Supported customer query params:

- `page`
- `limit`
- `search`
- `minProbability`
- `maxProbability`
- `contract`
- `internet`
- `riskLevel`
- `minTenure`
- `maxTenure`

Risk in the frontend is binary:

```ts
type RiskTier = 'low' | 'high'
```

Do not reintroduce old tiers like `moderate`, `elevated`, or `critical` as risk labels. The overview card named “Critical risk” is just a KPI for very high probability customers, not a risk enum.

## UI Style

Follow the current product UI:

- Quiet CRM/workspace layout.
- Dense but readable tables.
- Drawers/modals for focused workflows.
- Use Lucide icons for buttons.
- Keep cards/panels square-ish, consistent with existing Tailwind styling.
- Avoid adding marketing-style hero sections inside the app shell.
- Avoid visible instructional text that explains implementation details.

## Build And Validation

Run:

```bash
npm run build
```

before handing off frontend changes.

The build may warn about large chunks; that warning currently exists and is not itself a failure.

## Environment

Use `.env.example` as the reference.

Default local backend:

```txt
VITE_API_URL=http://localhost:8000/api
```

When using the Vite proxy, `/api` also works.
