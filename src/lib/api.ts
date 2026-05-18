import type { Customer } from '@/types'

// Base URL for the Express backend. Set via Vite env var in .env:
//   VITE_API_URL=http://localhost:3000/api
const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export type CustomerWithName = Customer & { displayName: string }

export interface OverviewStats {
  total: number
  atRisk: number
  critical: number
  retained: number
  avgMonthly: number
  avgTenure: number
  revenueAtRisk: number
}

export interface PredictionHistoryPoint {
  day: string
  predictions: number
  flagged: number
}

export interface RiskDistributionBucket {
  range: string
  count: number
  lower: number
}

export interface ContractAggregate {
  contract: string
  total: number
  churned: number
}

// ──────────────────────────────────────────────────────────────────────
// Fetch helpers — wire these up to your Express endpoints later
// ──────────────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  // GET /api/customers  → CustomerWithName[]
  listCustomers: () => request<CustomerWithName[]>('/customers'),

  // GET /api/customers/:id
  getCustomer: (id: string) =>
    request<CustomerWithName>(`/customers/${encodeURIComponent(id)}`),

  // GET /api/overview
  getOverview: () => request<OverviewStats>('/overview'),

  // GET /api/predictions/history
  getPredictionHistory: () =>
    request<PredictionHistoryPoint[]>('/predictions/history'),

  // GET /api/predictions/distribution
  getRiskDistribution: () =>
    request<RiskDistributionBucket[]>('/predictions/distribution'),

  // GET /api/analytics/by-contract
  getContractAggregates: () =>
    request<ContractAggregate[]>('/analytics/by-contract'),
}

// Empty defaults used while data is loading or before backend is connected.
export const emptyOverview: OverviewStats = {
  total: 0,
  atRisk: 0,
  critical: 0,
  retained: 0,
  avgMonthly: 0,
  avgTenure: 0,
  revenueAtRisk: 0,
}
