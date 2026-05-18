// Types mirror the Telco Customer Churn dataset described in the proposal.
// 21 features + churn prediction output from the ML service.

export type YesNo = 'Yes' | 'No'
export type Gender = 'Male' | 'Female'
export type ContractType = 'Month-to-month' | 'One year' | 'Two year'
export type InternetService = 'DSL' | 'Fiber optic' | 'No'
export type PaymentMethod =
  | 'Electronic check'
  | 'Mailed check'
  | 'Bank transfer (automatic)'
  | 'Credit card (automatic)'

export type ServiceOption = YesNo | 'No internet service'
export type MultipleLinesOption = YesNo | 'No phone service'

export type RiskTier = 'low' | 'high'

export interface RiskFactor {
  feature: string
  impact: number // 0..1, contribution from RF feature_importance
  direction: 'increases' | 'decreases'
}

export interface Customer {
  customerID: string
  // Demographics
  gender: Gender
  SeniorCitizen: 0 | 1
  Partner: YesNo
  Dependents: YesNo
  // Account
  tenure: number
  Contract: ContractType
  PaperlessBilling: YesNo
  PaymentMethod: PaymentMethod
  MonthlyCharges: number
  TotalCharges: number
  // Services
  PhoneService: YesNo
  MultipleLines: MultipleLinesOption
  InternetService: InternetService
  OnlineSecurity: ServiceOption
  OnlineBackup: ServiceOption
  DeviceProtection: ServiceOption
  TechSupport: ServiceOption
  StreamingTV: ServiceOption
  StreamingMovies: ServiceOption
  // Target / prediction
  Churn: YesNo
  churnProbability: number // 0..1 from RF predict_proba
  riskFactors: RiskFactor[]
  lastUpdated: string // ISO
}

export interface User {
  id: string
  name: string
  email: string
  role: 'CS Agent' | 'ChurnAi Manager' | 'Admin'
}

export interface FilterState {
  search: string
  minProbability: number
  maxProbability: number
  contract: ContractType | 'all'
  internet: InternetService | 'all'
  tenureRange: 'all' | '0-12' | '13-24' | '25-48' | '49+'
  riskTier: RiskTier | 'all'
}
