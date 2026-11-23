export type PlanDuration = '1_month' | '3_months' | '6_months' | '1_year' | 'lifetime';

export interface PlanConfig {
  id: PlanDuration;
  code: string;
  title: string;
  days: number;
}

export const APP_PLANS: Record<PlanDuration, PlanConfig> = {
  '1_month': { id: '1_month', code: '1M', title: '1 Month Access', days: 30 },
  '3_months': { id: '3_months', code: '3M', title: '3 Months Access', days: 90 },
  '6_months': { id: '6_months', code: '6M', title: '6 Months Access', days: 180 },
  '1_year': { id: '1_year', code: '1Y', title: '1 Year Access', days: 365 },
  'lifetime': { id: 'lifetime', code: 'LIFE', title: 'Lifetime Access', days: 0 },
};

export interface LicenseStatus {
  active: boolean;
  code?: string;
  client?: string;
  plan?: PlanDuration;
  planTitle?: string;
  expiryDate?: string | null;
  daysLeft?: number | null;
  error?: string;
}
