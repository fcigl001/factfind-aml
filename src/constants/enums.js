// ─── PIERS API Enumerated Values ─────────────────────────────────────────────
// Source: FACT_FINDER_INTEGRATION_SPEC.md Appendix 10.1

export const STAGE_OF_LIFE = [
  { value: 0, label: 'A single person or couple without children' },
  { value: 1, label: 'A single person or couple with young children' },
  { value: 2, label: 'A single person or couple with a mature family' },
  { value: 3, label: 'A single person or couple preparing for retirement' },
  { value: 4, label: 'A retired person or couple' },
]

export const EMPLOYMENT_TYPE = [
  { value: 0, label: 'PAYG' },
  { value: 1, label: 'Self-employed' },
]

export const EMPLOYMENT_TYPE_EXTENDED = [
  { value: 1, label: 'PAYG — Full time' },
  { value: 2, label: 'PAYG — Part time' },
  { value: 3, label: 'Casual' },
  { value: 4, label: 'Contractor' },
  { value: 5, label: 'Self-employed' },
  { value: 6, label: 'No employment' },
]

export const GOALS_WEEKLY_INCOME = [
  { value: '0', label: '$1,000 per week' },
  { value: '1', label: '$1,500 per week' },
  { value: '2', label: '$2,000 per week' },
  { value: '3', label: '$2,500 per week' },
  { value: '4', label: 'More (specify amount)' },
]

export const GOALS_PURPOSE = [
  { value: 0, label: 'Tax benefits' },
  { value: 1, label: 'Surplus funds' },
  { value: 2, label: 'Retirement planning' },
  { value: 3, label: 'Wealth creation' },
  { value: 4, label: 'Income stream' },
  { value: 5, label: 'Other (specify)' },
]

export const GOALS_TIMEFRAME = [
  { value: '0', label: 'Short-term (< 5 years)' },
  { value: '1', label: '5–10 years' },
  { value: '2', label: '10–15 years' },
  { value: '3', label: '15–25 years' },
  { value: '4', label: '25+ years' },
]

export const GOALS_RISK_PROFILE = [
  { value: '0', label: 'Cautious', desc: 'Security of capital is paramount. Prepared to accept lower returns.' },
  { value: '1', label: 'Conservative', desc: 'Stable, reliable returns with some income focus. Lower volatility tolerance.' },
  { value: '2', label: 'Moderate', desc: 'Balanced approach. Accepts some volatility for growth.' },
  { value: '3', label: 'Assertive', desc: 'Growth investor. Accepts higher volatility and moderate risk.' },
  { value: '4', label: 'Aggressive', desc: 'High growth. Security of capital is secondary to wealth creation.' },
]

export const MARKET_FAMILIARITY = [
  { value: 0, label: 'Very little understanding or interest' },
  { value: 1, label: 'Understand that property markets have many variables but am not familiar with them' },
  { value: 2, label: 'Understand the basics of investment property but unsure of the best way forward' },
  { value: 3, label: 'Experienced investor — understand the various factors that influence performance' },
]

export const EXPECTED_GROWTH = [
  { value: 0, label: '0–3%' },
  { value: 1, label: '3–5%' },
  { value: 2, label: '5–7%' },
  { value: 3, label: '7–10%' },
  { value: 4, label: '10%+' },
]

export const WAIT_BEFORE_SELLING = [
  { value: 0, label: 'Less than 1 year' },
  { value: 1, label: '1–2 years' },
  { value: 2, label: '2–5 years' },
  { value: 3, label: '5+ years' },
]

export const TAXATION_IMPORTANCE = [
  { value: 0, label: 'Not important' },
  { value: 1, label: 'Somewhat important' },
  { value: 2, label: 'Important' },
  { value: 3, label: 'Very important' },
]

export const INVESTMENT_TYPES = ['House', 'Apt', 'TownHouse', 'DualOcc', 'RoomHouse']

export const AU_STATES = ['NSW', 'QLD', 'VIC', 'WA', 'SA', 'TAS', 'ACT', 'NT']

export const LIABILITY_TYPES = [
  { value: 0, label: 'Credit Card' },
  { value: 1, label: 'Store Card' },
  { value: 2, label: 'Personal Loan' },
]

export const OTHER_ASSET_TYPES = [
  'Superannuation', 'Shares', 'Crypto', 'Bonds', 'Managed Funds', 'Cash', 'Other',
]

// Australia first so it is the natural default; rest alphabetical.
export const COUNTRIES = [
  'Australia',
  'New Zealand',
  'United Kingdom',
  'United States',
  'Canada',
  'Ireland',
  'India',
  'China',
  'Hong Kong',
  'Singapore',
  'Malaysia',
  'Philippines',
  'Vietnam',
  'Indonesia',
  'Thailand',
  'Japan',
  'South Korea',
  'South Africa',
  'Germany',
  'France',
  'Italy',
  'Netherlands',
  'Sri Lanka',
  'Pakistan',
  'Bangladesh',
  'Nepal',
  'Fiji',
  'Papua New Guinea',
  'Other',
]

export const RESIDENCY_STATUS = [
  'Australian citizen',
  'Permanent resident',
  'Temporary visa holder',
  'Foreign national',
]

export const HEALTH_STATUS = ['Fair', 'Average', 'Good', 'Excellent']

export const FORM_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  CLIENT_REVISING: 'CLIENT_REVISING',
  LOCKED: 'LOCKED',
  COMPLETED: 'COMPLETED',
}

export const AML_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
}
