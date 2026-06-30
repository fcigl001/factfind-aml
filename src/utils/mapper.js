// ─── PIERS API ↔ Form Data Mapper ────────────────────────────────────────────
// Handles all the field name quirks documented in spec Section 6.2 and 6.3.

import { GOALS_WEEKLY_INCOME, GOALS_TIMEFRAME, GOALS_RISK_PROFILE, GOALS_PURPOSE, RESIDENCY_STATUS, LIABILITY_TYPES } from '../constants/enums.js'

/** Liability type: numeric code or label ("Credit Card") → LIABILITY_TYPES value (0–2). Defaults to 0. */
function mapLiabilityType(val) {
  if (val === null || val === undefined || val === '') return 0
  const asInt = typeof val === 'number' ? val : parseInt(val, 10)
  if (!isNaN(asInt) && LIABILITY_TYPES.some(o => o.value === asInt)) return asInt
  const match = LIABILITY_TYPES.find(o => o.label.toLowerCase() === String(val).trim().toLowerCase())
  return match ? match.value : 0
}

// ─── Goals value coercion ────────────────────────────────────────────────────
// The server may send either PIERS enum codes ("0"-"4") OR human-readable values
// (dollar amounts, "15 years", "Conservative", a comma-list of purposes). These
// helpers map whatever arrives onto the coded chip/choice values the UI expects.

/** Weekly retirement income: dollar amount or code → GOALS_WEEKLY_INCOME value ("0"-"4"). */
function mapWeeklyIncome(val) {
  if (val == null || val === '') return null
  const s = String(val).trim()
  // Already a valid code
  if (GOALS_WEEKLY_INCOME.some(o => o.value === s)) return s
  const n = parseFloat(s.replace(/[^0-9.]/g, ''))
  if (!isFinite(n)) return null
  if (n <= 1000) return '0'
  if (n <= 1500) return '1'
  if (n <= 2000) return '2'
  if (n <= 2500) return '3'
  return '4'  // More (specify)
}

/** Timeframe: "15 years" / years number / code → GOALS_TIMEFRAME value ("0"-"4"). */
function mapTimeframe(val) {
  if (val == null || val === '') return null
  const s = String(val).trim()
  if (GOALS_TIMEFRAME.some(o => o.value === s)) return s
  const years = parseFloat(s.replace(/[^0-9.]/g, ''))
  if (!isFinite(years)) return null
  if (years < 5) return '0'
  if (years <= 10) return '1'
  if (years <= 15) return '2'
  if (years <= 25) return '3'
  return '4'
}

/** Risk profile: label ("Conservative") or code → GOALS_RISK_PROFILE value ("0"-"4"). */
function mapRiskProfile(val) {
  if (val == null || val === '') return null
  const s = String(val).trim()
  if (GOALS_RISK_PROFILE.some(o => o.value === s)) return s
  const match = GOALS_RISK_PROFILE.find(o => o.label.toLowerCase() === s.toLowerCase())
  return match ? match.value : null
}

/** Purpose: comma-list of labels, array, or code list → array of GOALS_PURPOSE values. */
function mapPurpose(val) {
  if (val == null || val === '') return []
  const tokens = Array.isArray(val) ? val : String(val).split(',')
  const out = []
  for (const raw of tokens) {
    const t = String(raw).trim()
    if (t === '') continue
    // Already a code?
    const byCode = GOALS_PURPOSE.find(o => String(o.value) === t)
    if (byCode) { if (!out.includes(byCode.value)) out.push(byCode.value); continue }
    // Match by label (case-insensitive)
    const byLabel = GOALS_PURPOSE.find(o => o.label.toLowerCase() === t.toLowerCase())
    if (byLabel && !out.includes(byLabel.value)) out.push(byLabel.value)
  }
  return out
}

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Normalise a birthdate value (ISO string, year-only, or Date) to YYYY-MM-DD for <input type="date"> */
export function normaliseBirthDate(val) {
  if (!val) return ''
  const s = String(val).trim()
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // ISO datetime — take date portion
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.substring(0, 10)
  // Year-only legacy (e.g. "1964") — leave as-is, date input will show partial
  if (/^\d{4}$/.test(s)) return s
  return s
}

// ─── Currency helpers ─────────────────────────────────────────────────────────

export function parseCurrency(val) {
  if (val === null || val === undefined || val === '') return 0
  if (typeof val === 'number') return val
  return parseFloat(String(val).replace(/[$,\s]/g, '')) || 0
}

export function formatCurrency(val) {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(val)
}

// ─── Employment type helper ──────────────────────────────────────────────────

// etype_id is 1-based: 1=PAYG Full Time, 2=PAYG Part Time, 3=Casual,
// 4=Contractor, 5=Self-Employed, 6=No Employment.
const EMPLOYMENT_TYPE_MAP = {
  'payg — full time': 1, 'payg full time': 1, 'payg - full time': 1,
  'payg — part time': 2, 'payg part time': 2, 'payg - part time': 2,
  'payg': 1,
  'casual': 3,
  'contractor': 4,
  'self employed': 5, 'self-employed': 5,
  'no employment': 6, 'unemployed': 6, 'retired': 6,
}

/**
 * Citizenship and residency status are now separate fields. Legacy records stored
 * a residency-status label (e.g. "Australian citizen") in the single `citizenship`
 * field. If `residency_status` is absent and `citizenship` actually holds a known
 * status label, migrate it across so the new dropdown shows the right value.
 */
export function splitCitizenship(citizenship, residencyStatus) {
  const cit = citizenship || ''
  const res = residencyStatus || ''
  // Legacy: a residency-status label stored in the citizenship field → migrate across.
  if (!res && RESIDENCY_STATUS.some(s => s.toLowerCase() === cit.trim().toLowerCase())) {
    return { citizenship: 'Australia', residency_status: cit.trim() }
  }
  // Default citizenship to Australia when the server sends nothing.
  return { citizenship: cit || 'Australia', residency_status: res }
}

export function parseEmploymentType(val) {
  if (val === null || val === undefined) return null
  // Already a valid integer code (1–6)
  const asInt = typeof val === 'number' ? val : parseInt(val, 10)
  if (!isNaN(asInt) && asInt >= 1 && asInt <= 6) return asInt
  // String label from database
  const key = String(val).trim().toLowerCase()
  if (key in EMPLOYMENT_TYPE_MAP) return EMPLOYMENT_TYPE_MAP[key]
  return null
}

// ─── Empty form state (used when no API data exists) ─────────────────────────

export function emptyFormData() {
  return {
    personal: {
      email: '',
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postcode: '',
      dependants: 0,
      income: '',
      citizenship: 'Australia',
      residency_status: '',
      employment: '',
      employment_type: null,   // 1=PAYG FT, 2=PAYG PT, 3=Casual, 4=Contractor, 5=Self-Employed, 6=No Employment
      birth_date: '',          // Year string e.g. "1964"
      stage_of_life: null,     // Integer 0-4
      health: '',
    },
    partner: {
      has_partner: false,
      first_name: '',
      last_name: '',
      middle_name: '',
      phone: '',
      phone_1: '',
      email: '',
      income: '',
      citizenship: 'Australia',
      residency_status: '',
      employment: '',
      employment_type: null,
      birth_date: '',
      health: '',
    },
    goals: {
      goals_list: [{
        goals_q_1_amount_per_week: null,        // String "0"-"4"
        goals_q_1_amount_per_week_other: 0,     // Number, used when above = "4"
        goals_q_2_purpose: [],                  // Array of integers
        goals_q_2a_comment: '',
        goals_q_3_time_frame: null,             // String "0"-"4"
        goals_q_4_contribution: '',             // Number
        goals_q_5_budget: '',                   // Number
        goals_q_6_profile: null,               // String "0"-"4"
      }],
    },
    finance: {
      assets_list: [{
        finance_address: '',
        property_type: 'Home',
        weekly_rent: 0,
        finance_value: '',
        finance_loan_type: 'Variable',
        finance_loan_balance: '',
        finance_rate: '',
      }],
      other_assets_list: [],
      liabilities_list: [],
    },
    property: {
      property_list: [{
        property_q_1_familar: null,
        property_q_2_growth: null,
        property_q_3_wait: null,
        property_q_4_type_preferences: null,
        property_q_4_types_of_investment: '',
        property_q_4_investment_preference_comment: '',
        property_q_5_location_preference: null,
        property_q_5_preference_location_states: '',
        property_q_5_preference_location_states_other: null,
        property_q_6_taxation: null,
        property_q_7_gearing: null,
      }],
      property_answers: [],
    },
    consent: {
      privacy: false,
      marketing: false,
    },
    aml: {
      // Advisor-only section — not sent to /api/generate-pdf
      id_doc_type: '',
      id_doc_number: '',
      id_doc_expiry: '',
      id_issuing_authority: '',
      id_name_matches: '',
      id_secondary_type: '',
      id_verification_method: '',
      id_verified_date: '',
      pep_status: '',      // not_pep | pep_domestic | pep_foreign | pep_associate
      tfs_status: '',
      tfs_screening_date: '',
      source_of_funds: '',
      source_of_wealth: '',
      relationship_purpose: '',
      estimated_purchase_value: '',
      source_of_funds_detail: '',
      ml_tf_risk_rating: '',  // low | medium | high
      // Contemporaneous notes
      notes_identity: '',
      notes_source_of_funds: '',
      notes_goals_realistic: '',
      smr_status: 'no_smr',
      smr_reference: '',
      advisor_name: '',
      meeting_date: '',
    },
  }
}

// ─── Map GET /api/clients/{clientId} response → form state ───────────────────

export function mapClientToForm(clientData) {
  const d = clientData?.data || clientData || {}
  const form = emptyFormData()

  // Personal — handle legacy typo "adddress"
  form.personal.email = d.email || ''
  form.personal.first_name = d.first_name || ''
  form.personal.last_name = d.last_name || ''
  form.personal.middle_name = d.middle_name || ''
  form.personal.phone = d.mobile || d.phone || ''
  form.personal.address = d.adddress || d.address || ''  // triple-d typo preserved
  form.personal.city = d.city || ''
  form.personal.state = d.state || ''
  form.personal.postcode = d.post_code || d.postcode || ''
  form.personal.dependants = parseInt(d.dependants) || 0
  form.personal.income = parseCurrency(d.wages)          // "wages" → income
  ;({ citizenship: form.personal.citizenship, residency_status: form.personal.residency_status } =
    splitCitizenship(d.citizenship, d.residency_status))
  form.personal.employment = d.employment || d.occupation || ''
  form.personal.employment_type = parseEmploymentType(d.etype_id)
  // birthdate: "1964-02-24" → "1964-02-24" (full date for AML compliance)
  form.personal.birth_date = normaliseBirthDate(d.birthdate)
  form.personal.stage_of_life = d.stage_of_life !== undefined ? parseInt(d.stage_of_life) : null
  form.personal.health = d.health || ''

  // Partner — may come from related_data or need separate fetch via related_id
  const partnerData = d.partner || d.related_data || null
  if (partnerData) {
    form.partner.has_partner = true
    form.partner.first_name = partnerData.first_name || ''
    form.partner.last_name = partnerData.last_name || ''
    form.partner.middle_name = partnerData.middle_name || ''
    form.partner.phone = partnerData.mobile || partnerData.phone || ''
    form.partner.phone_1 = partnerData.phone_1 || partnerData.mobile || ''
    form.partner.email = partnerData.email || ''
    form.partner.income = parseCurrency(partnerData.wages)
    ;({ citizenship: form.partner.citizenship, residency_status: form.partner.residency_status } =
      splitCitizenship(partnerData.citizenship, partnerData.residency_status))
    form.partner.employment = partnerData.employment || partnerData.occupation || ''
    form.partner.employment_type = parseEmploymentType(partnerData.etype_id)
    form.partner.birth_date = normaliseBirthDate(partnerData.birthdate)
    form.partner.health = partnerData.health || ''
  }

  // Goals
  const apiGoals = Array.isArray(d.goals) ? d.goals : []
  if (apiGoals.length > 0) {
    form.goals.goals_list = apiGoals.map(g => ({
      goals_q_1_amount_per_week: mapWeeklyIncome(g.required_amount),
      goals_q_1_amount_per_week_other: g.required_amount_other || 0,
      goals_q_2_purpose: mapPurpose(g.purpose),
      goals_q_2a_comment: g.purpose_comment || '',
      goals_q_3_time_frame: mapTimeframe(g.timeframe),
      goals_q_4_contribution: g.contribution || '',
      goals_q_5_budget: g.purchase_budget || '',
      goals_q_6_profile: mapRiskProfile(g.risk_profile),
    }))
  }

  // Finance — property assets (filter out superannuation/managed fund entries)
  const superKeywords = /super|superannuation|smsf|retirement\s*fund/i
  const apiAssets = Array.isArray(d.assets) ? d.assets : []
  const propertyAssets = []
  const misplacedAssets = []
  for (const a of apiAssets) {
    if (superKeywords.test(a.description || '')) {
      misplacedAssets.push(a)
    } else {
      propertyAssets.push(a)
    }
  }
  if (propertyAssets.length > 0) {
    form.finance.assets_list = propertyAssets.map(a => ({
      finance_address: a.description || '',
      property_type: /investment/i.test(a.asset_type || a.property_type || '') ? 'Investment' : 'Home',
      weekly_rent: parseCurrency(a.weekly_rent),
      finance_value: parseCurrency(a.value),
      finance_loan_type: a.loan_type || 'Variable',
      finance_loan_balance: parseCurrency(a.loan_balance),
      finance_rate: a.interest_rate || '',
    }))
  }

  // Finance — other assets (include any misplaced super entries from property assets)
  const apiOther = Array.isArray(d.other_assets) ? d.other_assets : []
  form.finance.other_assets_list = [
    ...apiOther.map(a => ({
      finance_other_asset_description: a.asset_type || '',
      finance_other_asset_description_name: a.asset_name || a.description || '',
      finance_other_asset_amount: parseCurrency(a.value),
      finance_other_asset_other_description: null,
    })),
    ...misplacedAssets.map(a => ({
      finance_other_asset_description: 'Superannuation',
      finance_other_asset_description_name: a.description || '',
      finance_other_asset_amount: parseCurrency(a.value),
      finance_other_asset_other_description: null,
    })),
  ]

  // Finance — liabilities
  const apiLiabs = Array.isArray(d.liabilities) ? d.liabilities : []
  form.finance.liabilities_list = apiLiabs.map(l => ({
    finance_liability_type: mapLiabilityType(l.loan_type),
    finance_liability_description: l.description || '',
    finance_liability_limit: parseCurrency(l.value),
    finance_liability_balance: parseCurrency(l.balance),
    finance_liability_repayment: parseCurrency(l.payment_amount),
  }))

  // Property preferences
  const apiProp = Array.isArray(d.property_fact_finds) ? d.property_fact_finds : []
  if (apiProp.length > 0) {
    const p = apiProp[0]
    form.property.property_list = [{
      property_q_1_familar: p.familiarity_with_markets !== undefined ? parseInt(p.familiarity_with_markets) : null,
      property_q_2_growth: p.expected_capital_growth !== undefined ? parseInt(p.expected_capital_growth) : null,
      property_q_3_wait: p.wait_time_before_selling !== undefined ? parseInt(p.wait_time_before_selling) : null,
      property_q_4_type_preferences: p.has_type_preferences === true ? 'Yes' : p.has_type_preferences === false ? 'No' : (p.types_of_investment ? 'Yes' : null),
      property_q_4_types_of_investment: p.types_of_investment || '',
      property_q_4_investment_preference_comment: p.investment_preference_comment || '',
      property_q_5_location_preference: p.has_location_preference === true ? 'Yes' : p.has_location_preference === false ? 'No' : (p.preferred_states ? 'Yes' : null),
      property_q_5_preference_location_states: p.preferred_states || '',
      property_q_5_preference_location_states_other: p.preferred_states_other || null,
      property_q_6_taxation: p.taxation_importance !== undefined ? parseInt(p.taxation_importance) : null,
      property_q_7_gearing: p.familiar_with_gearing !== undefined ? (parseInt(p.familiar_with_gearing) ? 'Yes' : 'No') : null,
    }]
  }

  // If server already has form_data saved, use that as source of truth
  // Only merge non-null values so draft nulls don't overwrite mapped API data
  const mergeNonNull = (target, source) => {
    for (const [key, val] of Object.entries(source)) {
      if (val !== null && val !== undefined && val !== '') {
        target[key] = val
      }
    }
  }
  if (d.form_data && Object.keys(d.form_data).length > 0) {
    const fd = d.form_data
    if (fd.personal) mergeNonNull(form.personal, fd.personal)
    if (fd.partner) mergeNonNull(form.partner, fd.partner)
    if (fd.goals) Object.assign(form.goals, fd.goals)
    if (fd.finance) Object.assign(form.finance, fd.finance)
    if (fd.property) Object.assign(form.property, fd.property)
    if (fd.aml) mergeNonNull(form.aml, fd.aml)
    if (fd.privacy !== undefined) form.consent.privacy = fd.privacy
    if (fd.marketing !== undefined) form.consent.marketing = fd.marketing
  }

  // AML record — may also arrive as a top-level FK'd table (client_aml_records)
  // rather than nested in form_data. Merge it last so it wins for advisor data.
  const amlRecord = d.aml || d.client_aml_record || d.aml_record || null
  if (amlRecord && typeof amlRecord === 'object') {
    mergeNonNull(form.aml, amlRecord)
  }

  // Infer employment_type from employment string if still null
  if (form.personal.employment_type === null && form.personal.employment) {
    form.personal.employment_type = parseEmploymentType(form.personal.employment)
  }
  if (form.partner.employment_type === null && form.partner.employment) {
    form.partner.employment_type = parseEmploymentType(form.partner.employment)
  }

  return form
}

// ─── Map form state → POST /api/generate-pdf payload ─────────────────────────

export function buildSubmitPayload(clientId, userId, specialistId, formData) {
  const f = formData
  const p = f.personal
  const pr = f.partner
  const g = f.goals.goals_list[0] || {}
  const propPrefs = f.property.property_list[0] || {}

  // Build property_answers array (same structure for both property_list and property_answers)
  const propertyAnswers = f.property.property_list.map((pp, idx) => ({
    applicant_number: idx + 1,
    property_q_1_familar: pp.property_q_1_familar,
    property_q_2_growth: pp.property_q_2_growth,
    property_q_3_wait: pp.property_q_3_wait,
    property_q_4_type_preferences: pp.property_q_4_type_preferences,
    property_q_4_types_of_investment: pp.property_q_4_types_of_investment,
    property_q_4_investment_preference_comment: pp.property_q_4_investment_preference_comment,
    property_q_5_location_preference: pp.property_q_5_location_preference,
    property_q_5_preference_location_states: pp.property_q_5_preference_location_states,
    property_q_5_preference_location_states_other: pp.property_q_5_preference_location_states_other,
    property_q_6_taxation: pp.property_q_6_taxation,
    property_q_7_gearing: pp.property_q_7_gearing === 'Yes' ? 1 : pp.property_q_7_gearing === 'No' ? 0 : pp.property_q_7_gearing,
  }))

  return {
    client_id: clientId,
    user_id: userId,
    specialist_id: specialistId,

    // ── form_data (v2 structure) ──────────────────────────────────────────────
    form_data: {
      personal: {
        email: p.email,
        first_name: p.first_name,
        last_name: p.last_name,
        middle_name: p.middle_name,
        phone: p.phone,
        personal_email: p.email,
        address: p.address,
        city: p.city,
        state: p.state,
        postcode: p.postcode,
        dependants: parseInt(p.dependants) || 0,
        income: parseCurrency(p.income),
        employment_type: p.employment_type !== null ? parseInt(p.employment_type) : null,
        birth_date: p.birth_date,
        citizenship: p.citizenship,
        residency_status: p.residency_status,
        employment: p.employment,
        stage_of_life: p.stage_of_life,
        health: p.health,
      },
      partner: pr.has_partner ? {
        first_name: pr.first_name,
        last_name: pr.last_name,
        middle_name: pr.middle_name,
        phone: pr.phone,
        phone_1: pr.phone_1 || pr.phone,
        email: pr.email,
        income: parseCurrency(pr.income),
        employment: pr.employment,
        employment_type: pr.employment_type !== null ? parseInt(pr.employment_type) : null,
        birth_date: pr.birth_date,
        citizenship: pr.citizenship,
        residency_status: pr.residency_status,
        health: pr.health,
      } : null,
      goals: {
        goals_list: f.goals.goals_list.map(gl => ({
          goals_q_1_amount_per_week: gl.goals_q_1_amount_per_week != null && gl.goals_q_1_amount_per_week !== 'null'
            ? parseInt(gl.goals_q_1_amount_per_week, 10) : null,
          goals_q_1_amount_per_week_other: parseCurrency(gl.goals_q_1_amount_per_week_other),
          goals_q_2_purpose: gl.goals_q_2_purpose,
          goals_q_2a_comment: gl.goals_q_2a_comment,
          goals_q_3_time_frame: gl.goals_q_3_time_frame != null && gl.goals_q_3_time_frame !== 'null'
            ? parseInt(gl.goals_q_3_time_frame, 10) : null,
          goals_q_4_contribution: parseCurrency(gl.goals_q_4_contribution),
          goals_q_5_budget: parseCurrency(gl.goals_q_5_budget),
          goals_q_6_profile: gl.goals_q_6_profile != null && gl.goals_q_6_profile !== 'null'
            ? parseInt(gl.goals_q_6_profile, 10) : null,
        })),
      },
      finance: {
        assets_list: f.finance.assets_list.map(a => ({
          finance_address: a.finance_address,
          property_type: a.property_type,
          weekly_rent: parseCurrency(a.weekly_rent),
          finance_value: parseCurrency(a.finance_value),
          finance_loan_type: a.finance_loan_type,
          finance_loan_balance: parseCurrency(a.finance_loan_balance),
          finance_rate: parseFloat(a.finance_rate) || 0,
        })),
        other_assets_list: f.finance.other_assets_list.map(a => ({
          finance_other_asset_description: a.finance_other_asset_description,
          finance_other_asset_description_name: a.finance_other_asset_description_name,
          finance_other_asset_amount: parseCurrency(a.finance_other_asset_amount),
          finance_other_asset_other_description: a.finance_other_asset_other_description,
        })),
        liabilities_list: f.finance.liabilities_list.map(l => ({
          finance_liability_type: parseInt(l.finance_liability_type),
          finance_liability_description: l.finance_liability_description,
          finance_liability_limit: parseCurrency(l.finance_liability_limit),
          finance_liability_balance: parseCurrency(l.finance_liability_balance),
          finance_liability_repayment: parseCurrency(l.finance_liability_repayment),
        })),
      },
      property: {
        property_list: f.property.property_list,
        property_answers: propertyAnswers,
      },
      privacy: f.consent.privacy,
      marketing: f.consent.marketing,
    },

    // ── Legacy root-level fields (backward compat — spec Section 6.1) ─────────
    stage_of_life: p.stage_of_life,
    personal_income: parseCurrency(p.income),
    partner_income: pr.has_partner ? parseCurrency(pr.income) : 0,
    personal_birth_date: p.birth_date,
    partner_middle_name: pr.has_partner ? pr.middle_name : null,
    partner_phone_1: pr.has_partner ? (pr.phone_1 || pr.phone) : null,
    property_answers: propertyAnswers,
  }
}
