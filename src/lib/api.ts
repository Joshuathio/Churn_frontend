import type { Customer } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export type CustomerWithName = Customer & { displayName: string }

// Input payload untuk create/update. Server yang generate customerID,
// churnProbability, riskFactors, lastUpdated.
export type CustomerInput = Omit<
  Customer,
  'customerID' | 'churnProbability' | 'riskFactors' | 'lastUpdated' | 'Churn'
> & {
  fullName: string
  displayName: string
}

export interface CustomerListParams {
  page?: number
  limit?: number
  search?: string
  minProbability?: number
  maxProbability?: number
  contract?: string
  internet?: string
  riskLevel?: 'LOW' | 'HIGH'
  minTenure?: number
  maxTenure?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  totalRecords: number
  totalPages: number
}

export interface PaginatedCustomers {
  msg: 'success'
  data: CustomerWithName[]
  meta: PaginationMeta
}

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
    credentials: 'include',
    ...init,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  // Reads
  listCustomers: (params: CustomerListParams = {}) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value))
      }
    })
    const query = search.toString()
    return request<PaginatedCustomers>(`/customers${query ? `?${query}` : ''}`)
  },
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
      method: 'PATCH',
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
