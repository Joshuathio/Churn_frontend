import type {
  CasePriority,
  CaseResolutionOutcome,
  CaseStatus,
  Customer,
  InterventionAnalytics,
  InterventionCase,
  OfferStatus,
  OfferType,
  OutreachChannel,
  OutreachLog,
  OutreachOutcome,
  RetentionOffer,
} from '@/types'

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

export interface PaginatedCases {
  msg: 'success'
  data: InterventionCase[]
  meta: {
    page: number
    limit: number
    totalRecords: number
    totalPages: number
    scope: 'mine' | 'unassigned' | 'all'
  }
}

export interface CaseListParams {
  page?: number
  limit?: number
  status?: CaseStatus
  priority?: CasePriority
  customerID?: string
  scope?: 'mine' | 'unassigned' | 'all'
}

export interface OpenCaseInput {
  customerID: string
  assignedToId?: string
  priority?: CasePriority
  reason?: string
}

export interface OutreachInput {
  channel: OutreachChannel
  outcome: OutreachOutcome
  notes?: string
  nextFollowUpAt?: string
}

export interface RetentionOfferInput {
  offerType: OfferType
  title: string
  description?: string
  discountPercent?: number
  discountAmount?: number
  durationMonths?: number
}

export interface UpdateCaseInput {
  status?: CaseStatus
  priority?: CasePriority
  assignedToId?: string | null
  reason?: string | null
  resolutionOutcome?: CaseResolutionOutcome | null
  resolutionNote?: string | null
  finalOutreachLogId?: string | null
  finalOfferId?: string | null
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
  listInterventionCases: (params: CaseListParams = {}) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        search.set(key, String(value))
      }
    })
    const query = search.toString()
    return request<PaginatedCases>(`/interventions/cases${query ? `?${query}` : ''}`)
  },
  getInterventionCase: (id: string) =>
    request<InterventionCase>(`/interventions/cases/${encodeURIComponent(id)}`),
  getInterventionAnalytics: () =>
    request<InterventionAnalytics>('/interventions/analytics'),

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
  openInterventionCase: (payload: OpenCaseInput) =>
    request<InterventionCase>('/interventions/cases', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInterventionCase: (id: string, payload: UpdateCaseInput) =>
    request<InterventionCase>(`/interventions/cases/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  claimInterventionCase: (id: string) =>
    request<InterventionCase>(`/interventions/cases/${encodeURIComponent(id)}/claim`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
  createOutreachLog: (caseId: string, payload: OutreachInput) =>
    request<OutreachLog>(`/interventions/cases/${encodeURIComponent(caseId)}/outreach`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createRetentionOffer: (caseId: string, payload: RetentionOfferInput) =>
    request<RetentionOffer>(`/interventions/cases/${encodeURIComponent(caseId)}/offers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateRetentionOfferStatus: (offerId: string, status: OfferStatus) =>
    request<RetentionOffer>(`/interventions/offers/${encodeURIComponent(offerId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
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
