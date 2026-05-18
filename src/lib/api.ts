import type { Customer } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export type CustomerWithName = Customer & { displayName: string }

// Input payload untuk create/update. Server yang generate customerID,
// churnProbability, riskFactors, lastUpdated.
export type CustomerInput = Omit <Customer,'customerID' | 'churnProbability' | 'riskFactors' | 'lastUpdated' | 'Churn'> & {displayName: string}

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
  // Reads
  listCustomers: () => request<CustomerWithName[]>('/customers'),
  getCustomer: (id: string) =>
    request<CustomerWithName>(`/customers/${encodeURIComponent(id)}`),
  getOverview: () => request<OverviewStats>('/overview'),
  getPredictionHistory: () =>
    request<PredictionHistoryPoint[]>('/predictions/history'),
  getRiskDistribution: () =>
    request<RiskDistributionBucket[]>('/predictions/distribution'),
  getContractAggregates: () =>
    request<ContractAggregate[]>('/analytics/by-contract'),

  // Mutations
  createCustomer: (payload: CustomerInput) =>
    request<CustomerWithName>('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCustomer: (id: string, payload: CustomerInput) =>
    request<CustomerWithName>(`/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteCustomer: (id: string) =>
    request<{ ok: true }>(`/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
}

export const emptyOverview: OverviewStats = {
  total: 0,
  atRisk: 0,
  critical: 0,
  retained: 0,
  avgMonthly: 0,
  avgTenure: 0,
  revenueAtRisk: 0,
}