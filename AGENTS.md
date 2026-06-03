# Churn Prediction Frontend

## Project Scope

This folder contains the remade ChurnAi frontend. Keep backend behavior compatible with:

- Express/Prisma API at `VITE_API_URL` or `/api`
- Better Auth cookie sessions under `/api/auth/*`
- Flask ML service called indirectly through the Express backend

Do not call the Flask service directly from the browser.

## Frontend Rules

- Use React, TypeScript, Vite, and Tailwind.
- Preserve the ChurnAi visual language: `ink`, `bone`, `ember`, `moss`, and `rust`.
- Preserve the existing product logic: overview, customers CRUD, filters, analytics, interventions, outreach, offers, settings, and auth.
- Risk display must follow backend risk level first and use `0.59` as the probability fallback threshold.
- Keep manager-only UI hidden from CS agents. Backend permissions still enforce access, but the frontend must not show manager-only controls to agents.
- Keep CSV export client-side unless a backend export endpoint is explicitly added later.

## Backend Contract

The frontend expects:

- `GET /api/users/agents` for manager assignment lists.
- `PATCH /api/interventions/cases/:id` with `assignedToId` for manager assignment changes.
- Customer payload fields must match the Telco/Prisma casing, for example `SeniorCitizen`, `MonthlyCharges`, `InternetService`, and `PaymentMethod`.

## Verification

Before handing off frontend changes, run:

```bash
npm run build
```

If backend contract files are changed, also run the backend build from `../churn-prediction-backend`:

```bash
npm run build
```
