import React from 'react'
import {
  C, Card, SectionHead, SectionLabel, Divider, Grid, Field,
  Input, CurrencyInput, Select, Textarea, PillGroup, ToggleBar, ChipGroup,
  ChoiceRow, CheckRow, ConsentRow, AddRowButton, RemoveRowButton,
  Banner, Button, AmlBadge,
} from './UI.jsx'
import {
  STAGE_OF_LIFE, EMPLOYMENT_TYPE_EXTENDED, GOALS_WEEKLY_INCOME,
  GOALS_PURPOSE, GOALS_TIMEFRAME, GOALS_RISK_PROFILE,
  MARKET_FAMILIARITY, EXPECTED_GROWTH, WAIT_BEFORE_SELLING,
  TAXATION_IMPORTANCE, AU_STATES, LIABILITY_TYPES, OTHER_ASSET_TYPES,
  HEALTH_STATUS, INVESTMENT_TYPES, RESIDENCY_STATUS, COUNTRIES,
} from '../constants/enums.js'
import { uploadAmlDocument, getAmlStatus, initiateAmlCheck } from '../utils/api.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function set(obj, path, value) {
  // Immutable deep setter for nested paths like "personal.first_name"
  const keys = path.split('.')
  const result = { ...obj }
  let cur = result
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = Array.isArray(cur[keys[i]]) ? [...cur[keys[i]]] : { ...cur[keys[i]] }
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
  return result
}

function setArr(arr, idx, key, value) {
  return arr.map((item, i) => i === idx ? { ...item, [key]: value } : item)
}

// ─── PAGE 0: Start / Privacy & Consent ───────────────────────────────────────

export function StartPage({ formData, onChange, disabled, companyName, advisorName }) {
  const { consent } = formData
  return (
    <div>
      <Banner type="orange" icon="⚠">
        <strong>Scope of service:</strong> {companyName || 'PIERS TECH Pty Ltd'} provides software services to support property investment education and evaluation.
        This is <em>not</em> financial product advice under the <em>Corporations Act 2001</em>.
        Property is not a financial product under that Act. Seek independent legal, financial and
        taxation advice for your personal circumstances.
      </Banner>

      <Banner type="blue" icon="🔒">
        <strong>AML/CTF Notice:</strong> From 1 July 2026 {companyName || 'PIERS TECH Pty Ltd'} is a reporting entity under the{' '}
        <em>Anti-Money Laundering and Counter-Terrorism Financing Act 2006</em> (Cth). We are required
        by law to verify your identity before providing services. Services cannot be provided if
        identity verification cannot be completed.
      </Banner>

      {/* Privacy Collection Notice */}
      <div style={{
        background: C.bgCard, borderRadius: 12,
        border: `0.5px solid ${C.border}`, marginBottom: 14, overflow: 'hidden',
      }}>
        <div style={{
          background: C.dark, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: C.orange,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: C.white, flexShrink: 0,
          }}>🛡</div>
          <div>
            <div style={{ color: C.white, fontSize: 12, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
              Privacy Collection Notice — APP 5, Privacy Act 1988 (Cth)
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9.5, fontFamily: 'Poppins, sans-serif' }}>
              Read carefully before completing this form
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {[
              ['Who collects', `${companyName || 'PIERS TECH Pty Ltd'} ABN 87 681 725 333 and your appointed ${companyName || 'PIERS TECH Pty Ltd'} Certified Advisor${advisorName ? ` (${advisorName})` : ''}.`],
              ['Why we collect', 'To prepare your Property Investment Evaluation Plan (PIEP) and meet AML/CTF obligations.'],
              ['What we collect', 'Identity, financial position, goals, risk profile, source of funds and ID verification documents.'],
              ['Who we share with', 'Your dealer group, buyers agent, broker, solicitor or accountant as needed. Also AUSTRAC where required by law.'],
            ].map(([heading, body]) => (
              <div key={heading} style={{ background: C.bgField, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: C.orange, marginBottom: 3, fontFamily: 'Poppins, sans-serif' }}>
                  {heading}
                </div>
                <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.6, fontFamily: 'Poppins, sans-serif' }}>
                  {body}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: C.bgField, borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: C.orange, marginBottom: 3, fontFamily: 'Poppins, sans-serif' }}>
              Your rights
            </div>
            <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.6, fontFamily: 'Poppins, sans-serif' }}>
              Access, correct or request deletion of your information:{' '}
              <strong>privacy@pierstech.com</strong>. Complaints to the OAIC:{' '}
              <strong>oaic.gov.au</strong> or 1300 363 992. Data stored securely in Australia
              and retained for 7 years then securely destroyed.
            </div>
          </div>
          <div style={{ height: 0.5, background: C.border, margin: '10px 0' }} />
          <ConsentRow
            checked={consent.privacy}
            onChange={v => onChange(set(formData, 'consent.privacy', v))}
            disabled={disabled}
          >
            <strong>I have read and understood this Privacy Collection Notice.</strong>{' '}
            I consent to {companyName || 'PIERS TECH Pty Ltd'} collecting, holding, using and disclosing my personal information
            as described, including for AML/CTF compliance purposes. I understand I can
            withdraw consent at any time.
          </ConsentRow>
        </div>
      </div>

      <Card>
        <Grid>
          <Field label="Your email address">
            <Input
              type="email"
              value={formData.personal.email}
              onChange={v => onChange(set(formData, 'personal.email', v))}
              placeholder="your@email.com.au"
              disabled={disabled}
            />
          </Field>
          <Field label="Referred by / advisor name">
            <Input value={advisorName || ''} onChange={() => {}} placeholder="e.g. John Smith" disabled />
          </Field>
        </Grid>
        <div style={{ marginTop: 10 }}>
          <ConsentRow
            checked={consent.marketing}
            onChange={v => onChange(set(formData, 'consent.marketing', v))}
            disabled={disabled}
          >
            I would like to receive property investment updates and information from {companyName || 'PIERS TECH Pty Ltd'}.
          </ConsentRow>
        </div>
      </Card>
    </div>
  )
}

// ─── PAGE 1: Personal Information ─────────────────────────────────────────────

export function PersonalPage({ formData, onChange, onBlur, disabled }) {
  const p = formData.personal
  const pr = formData.partner

  const upP = (key, val) => onChange(set(formData, `personal.${key}`, val))
  const upPr = (key, val) => onChange(set(formData, `partner.${key}`, val))

  return (
    <div>
      <Card>
        <SectionHead eyebrow="Person 1" title="Your details" />
        <Grid>
          <Field label="First name(s) — as per ID">
            <Input value={p.first_name} onChange={v => upP('first_name', v)} onBlur={onBlur} placeholder="e.g. Sarah Jane" disabled={disabled} />
          </Field>
          <Field label="Last name — as per ID">
            <Input value={p.last_name} onChange={v => upP('last_name', v)} onBlur={onBlur} placeholder="e.g. Jones" disabled={disabled} />
          </Field>
          <Field label="Phone">
            <Input value={p.phone} onChange={v => upP('phone', v)} onBlur={onBlur} placeholder="04xx xxx xxx" disabled={disabled} />
          </Field>
          <Field label="Email">
            <Input type="email" value={p.email} onChange={v => upP('email', v)} onBlur={onBlur} placeholder="sarah@email.com.au" disabled={disabled} />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={p.birth_date} onChange={v => upP('birth_date', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
          <Field label="Citizenship (country)">
            <Select
              value={p.citizenship}
              onChange={v => upP('citizenship', v)}
              onBlur={onBlur}
              disabled={disabled}
              options={COUNTRIES}
            />
          </Field>
          <Field label="Residency status">
            <Select
              value={p.residency_status}
              onChange={v => upP('residency_status', v)}
              onBlur={onBlur}
              disabled={disabled}
              options={RESIDENCY_STATUS}
            />
          </Field>
        </Grid>
        <Divider />
        <Grid style={{ marginBottom: 10 }}>
          <Field label="Residential address" style={{ gridColumn: 'span 2' }}>
            <Input value={p.address} onChange={v => upP('address', v)} onBlur={onBlur} placeholder="Street address" disabled={disabled} />
          </Field>
          <Field label="City / suburb">
            <Input value={p.city} onChange={v => upP('city', v)} onBlur={onBlur} placeholder="e.g. Parramatta" disabled={disabled} />
          </Field>
          <Field label="State">
            <Select value={p.state} onChange={v => upP('state', v)} onBlur={onBlur} disabled={disabled} options={AU_STATES} />
          </Field>
          <Field label="Postcode">
            <Input value={p.postcode} onChange={v => upP('postcode', v)} onBlur={onBlur} placeholder="2150" disabled={disabled} />
          </Field>
          <Field label="Number of dependants">
            <Input type="number" value={p.dependants} onChange={v => upP('dependants', parseInt(v) || 0)} onBlur={onBlur} placeholder="0" disabled={disabled} />
          </Field>
        </Grid>
        <Divider />
        <SectionLabel>Stage of life</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
          {STAGE_OF_LIFE.map(opt => (
            <ChoiceRow
              key={opt.value}
              label={opt.label}
              selected={p.stage_of_life === opt.value}
              onSelect={() => upP('stage_of_life', opt.value)}
              disabled={disabled}
            />
          ))}
        </div>
        <Divider />
        <Grid>
          <Field label="Occupation / business activity">
            <Input value={p.employment} onChange={v => upP('employment', v)} onBlur={onBlur} placeholder="e.g. Registered Nurse" disabled={disabled} />
          </Field>
          <Field label="Annual gross income ($)">
            <CurrencyInput value={p.income} onChange={v => upP('income', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
          <Field label="Health status">
            <Select value={p.health} onChange={v => upP('health', v)} onBlur={onBlur} disabled={disabled} options={HEALTH_STATUS} />
          </Field>
        </Grid>
        <Field label="Type of employment" style={{ marginTop: 12 }}>
          <PillGroup
            options={EMPLOYMENT_TYPE_EXTENDED}
            value={p.employment_type}
            onChange={v => upP('employment_type', v)}
            disabled={disabled}
          />
        </Field>
      </Card>

      {/* Partner toggle */}
      <div
        onClick={() => !disabled && upPr('has_partner', !pr.has_partner)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px', background: C.bgField,
          border: `0.5px solid ${C.border}`, borderRadius: 8, marginBottom: 12, cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, fontFamily: 'Poppins, sans-serif' }}>Partner / joint applicant</div>
          <div style={{ fontSize: 10.5, color: C.textSecondary, fontFamily: 'Poppins, sans-serif' }}>Add if this is a joint application</div>
        </div>
        <button style={{
          fontSize: 11, color: C.teal, background: 'none',
          border: `0.5px solid ${C.teal}`, borderRadius: 20, padding: '3px 12px',
          cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontWeight: 500,
        }}>
          {pr.has_partner ? '− Remove partner' : '+ Add partner'}
        </button>
      </div>

      {pr.has_partner && (
        <Card>
          <SectionHead eyebrow="Person 2 — Partner" title="Partner details" />
          <Grid>
            <Field label="First name(s) — as per ID">
              <Input value={pr.first_name} onChange={v => upPr('first_name', v)} onBlur={onBlur} placeholder="e.g. Michael" disabled={disabled} />
            </Field>
            <Field label="Last name — as per ID">
              <Input value={pr.last_name} onChange={v => upPr('last_name', v)} onBlur={onBlur} placeholder="e.g. Jones" disabled={disabled} />
            </Field>
            <Field label="Phone">
              <Input value={pr.phone} onChange={v => upPr('phone', v)} onBlur={onBlur} placeholder="04xx xxx xxx" disabled={disabled} />
            </Field>
            <Field label="Email">
              <Input type="email" value={pr.email} onChange={v => upPr('email', v)} onBlur={onBlur} placeholder="michael@email.com.au" disabled={disabled} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={pr.birth_date} onChange={v => upPr('birth_date', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
            <Field label="Citizenship (country)">
              <Select value={pr.citizenship} onChange={v => upPr('citizenship', v)} onBlur={onBlur} disabled={disabled} options={COUNTRIES} />
            </Field>
            <Field label="Residency status">
              <Select value={pr.residency_status} onChange={v => upPr('residency_status', v)} onBlur={onBlur} disabled={disabled} options={RESIDENCY_STATUS} />
            </Field>
            <Field label="Occupation / business activity">
              <Input value={pr.employment} onChange={v => upPr('employment', v)} onBlur={onBlur} placeholder="e.g. Registered Nurse" disabled={disabled} />
            </Field>
            <Field label="Annual gross income ($)">
              <CurrencyInput value={pr.income} onChange={v => upPr('income', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
            <Field label="Health status">
              <Select value={pr.health} onChange={v => upPr('health', v)} onBlur={onBlur} disabled={disabled} options={HEALTH_STATUS} />
            </Field>
          </Grid>
          <Field label="Type of employment" style={{ marginTop: 12 }}>
            <PillGroup
              options={EMPLOYMENT_TYPE_EXTENDED}
              value={pr.employment_type}
              onChange={v => upPr('employment_type', v)}
              disabled={disabled}
            />
          </Field>
        </Card>
      )}
    </div>
  )
}

// ─── PAGE 2: Goals ────────────────────────────────────────────────────────────

export function GoalsPage({ formData, onChange, onBlur, disabled }) {
  const gl = formData.goals.goals_list[0] || {}

  const upG = (key, val) => {
    const newList = setArr(formData.goals.goals_list, 0, key, val)
    onChange(set(formData, 'goals.goals_list', newList))
  }

  const togglePurpose = (val) => {
    const current = gl.goals_q_2_purpose || []
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
    upG('goals_q_2_purpose', next)
  }

  return (
    <div>
      <Card>
        <SectionHead eyebrow="Applicant 1" title="Your investment goals" />

        <SectionLabel>1. If your property investment became retirement income, how much per week would you want?</SectionLabel>
        <ChipGroup
          options={GOALS_WEEKLY_INCOME}
          value={gl.goals_q_1_amount_per_week}
          onChange={v => upG('goals_q_1_amount_per_week', v)}
          disabled={disabled}
        />
        {gl.goals_q_1_amount_per_week === '4' && (
          <Field label="Specify amount ($)" style={{ marginTop: 8, maxWidth: 200 }}>
            <CurrencyInput value={gl.goals_q_1_amount_per_week_other} onChange={v => upG('goals_q_1_amount_per_week_other', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
        )}

        <Divider />
        <SectionLabel>2. Which best describes your purpose for investing? (select all that apply)</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
          {GOALS_PURPOSE.map(opt => (
            <CheckRow
              key={opt.value}
              label={opt.label}
              checked={(gl.goals_q_2_purpose || []).includes(opt.value)}
              onToggle={() => togglePurpose(opt.value)}
              disabled={disabled}
            />
          ))}
        </div>
        <Field label="Additional comments">
          <Textarea value={gl.goals_q_2a_comment} onChange={v => upG('goals_q_2a_comment', v)} onBlur={onBlur} placeholder="Any other details about your goals…" disabled={disabled} />
        </Field>

        <Divider />
        <SectionLabel>3. How long are you willing to invest to achieve your goal?</SectionLabel>
        <ChipGroup
          options={GOALS_TIMEFRAME}
          value={gl.goals_q_3_time_frame}
          onChange={v => upG('goals_q_3_time_frame', v)}
          disabled={disabled}
        />

        <Divider />
        <Grid>
          <Field label="4. Weekly contribution toward goal ($)">
            <CurrencyInput value={gl.goals_q_4_contribution} onChange={v => upG('goals_q_4_contribution', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
          <Field label="5. Budget for property purchase ($)">
            <CurrencyInput value={gl.goals_q_5_budget} onChange={v => upG('goals_q_5_budget', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
        </Grid>

        <Divider />
        <SectionLabel>6. Which best describes your risk profile?</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {GOALS_RISK_PROFILE.map(opt => (
            <ChoiceRow
              key={opt.value}
              label={opt.label}
              subLabel={opt.desc}
              selected={gl.goals_q_6_profile === opt.value}
              onSelect={() => upG('goals_q_6_profile', opt.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── PAGE 3: Finance ──────────────────────────────────────────────────────────

export function FinancePage({ formData, onChange, onBlur, disabled }) {
  const fin = formData.finance

  const upAsset = (idx, key, val) => onChange(set(formData, 'finance.assets_list', setArr(fin.assets_list, idx, key, val)))
  const upOther = (idx, key, val) => onChange(set(formData, 'finance.other_assets_list', setArr(fin.other_assets_list, idx, key, val)))
  const upLiab = (idx, key, val) => onChange(set(formData, 'finance.liabilities_list', setArr(fin.liabilities_list, idx, key, val)))

  const addAsset = () => onChange(set(formData, 'finance.assets_list', [
    ...fin.assets_list,
    { finance_address: '', property_type: 'Home', weekly_rent: 0, finance_value: '', finance_loan_type: 'Variable', finance_loan_balance: '', finance_rate: '' },
  ]))
  const removeAsset = idx => onChange(set(formData, 'finance.assets_list', fin.assets_list.filter((_, i) => i !== idx)))

  const addOther = () => onChange(set(formData, 'finance.other_assets_list', [
    ...fin.other_assets_list,
    { finance_other_asset_description: '', finance_other_asset_description_name: '', finance_other_asset_amount: '' },
  ]))
  const removeOther = idx => onChange(set(formData, 'finance.other_assets_list', fin.other_assets_list.filter((_, i) => i !== idx)))

  const addLiab = () => onChange(set(formData, 'finance.liabilities_list', [
    ...fin.liabilities_list,
    { finance_liability_type: 0, finance_liability_description: '', finance_liability_limit: '', finance_liability_balance: '', finance_liability_repayment: '' },
  ]))
  const removeLiab = idx => onChange(set(formData, 'finance.liabilities_list', fin.liabilities_list.filter((_, i) => i !== idx)))

  // Detect superannuation-like entries in property assets list
  const superKeywords = /super|superannuation|smsf|retirement\s*fund/i
  const hasMisplacedSuper = fin.assets_list.some(a => superKeywords.test(a.finance_address))

  return (
    <div>
      {/* Property assets */}
      <Card>
        <SectionHead eyebrow="Assets" title="Property assets" />
        {hasMisplacedSuper && (
          <Banner type="orange" icon="⚠">
            It looks like you've entered a superannuation or managed fund here.
            Property assets is for real estate only. Please add super, shares and other
            non-property assets in the <strong>Other assets</strong> section below and remove
            the entry from this list.
          </Banner>
        )}
        {fin.assets_list.map((a, idx) => (
          <div key={idx} style={{ background: C.bgField, borderRadius: 8, padding: 10, marginBottom: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              <Field label="Description & address">
                <Input value={a.finance_address} onChange={v => upAsset(idx, 'finance_address', v)} onBlur={onBlur} placeholder="e.g. Home — 12 Smith St Parramatta" disabled={disabled} />
              </Field>
              <Field label="Property type">
                <ToggleBar
                  options={[{ value: 'Home', label: 'Home' }, { value: 'Investment', label: 'Investment' }]}
                  value={a.property_type}
                  onChange={v => upAsset(idx, 'property_type', v)}
                  disabled={disabled}
                />
              </Field>
              <Field label="Loan type">
                <ToggleBar
                  options={[{ value: 'Fixed', label: 'Fixed' }, { value: 'Variable', label: 'Variable' }]}
                  value={a.finance_loan_type}
                  onChange={v => upAsset(idx, 'finance_loan_type', v)}
                  disabled={disabled}
                />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 8, alignItems: 'end' }}>
              <Field label="Estimated value ($)">
                <CurrencyInput value={a.finance_value} onChange={v => upAsset(idx, 'finance_value', v)} onBlur={onBlur} disabled={disabled} />
              </Field>
              <Field label="Loan balance ($)">
                <CurrencyInput value={a.finance_loan_balance} onChange={v => upAsset(idx, 'finance_loan_balance', v)} onBlur={onBlur} disabled={disabled} />
              </Field>
              <Field label="Interest rate (%)">
                <Input type="number" value={a.finance_rate} onChange={v => upAsset(idx, 'finance_rate', v)} onBlur={onBlur} placeholder="5.5" disabled={disabled} />
              </Field>
              {idx > 0 && !disabled && (
                <RemoveRowButton onClick={() => removeAsset(idx)} />
              )}
            </div>
          </div>
        ))}
        {!disabled && <AddRowButton onClick={addAsset} label="+ Add property asset" />}
      </Card>

      {/* Other assets */}
      <Card>
        <SectionHead eyebrow="Assets" title="Other assets" />
        {fin.other_assets_list.map((a, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 40px', gap: 8, alignItems: 'end', background: C.bgField, borderRadius: 8, padding: 10, marginBottom: 6 }}>
            <Field label="Type">
              <Select value={a.finance_other_asset_description} onChange={v => upOther(idx, 'finance_other_asset_description', v)} onBlur={onBlur} disabled={disabled} options={OTHER_ASSET_TYPES} />
            </Field>
            <Field label="Description">
              <Input value={a.finance_other_asset_description_name} onChange={v => upOther(idx, 'finance_other_asset_description_name', v)} onBlur={onBlur} placeholder="e.g. AustralianSuper" disabled={disabled} />
            </Field>
            <Field label="Value ($)">
              <CurrencyInput value={a.finance_other_asset_amount} onChange={v => upOther(idx, 'finance_other_asset_amount', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
            {!disabled && <RemoveRowButton onClick={() => removeOther(idx)} />}
          </div>
        ))}
        {!disabled && <AddRowButton onClick={addOther} label="+ Add other asset" />}
      </Card>

      {/* Liabilities */}
      <Card>
        <SectionHead eyebrow="Liabilities" title="Non-property liabilities" />
        {fin.liabilities_list.map((l, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 40px', gap: 8, alignItems: 'end', background: C.bgField, borderRadius: 8, padding: 10, marginBottom: 6 }}>
            <Field label="Type">
              <Select value={l.finance_liability_type} onChange={v => upLiab(idx, 'finance_liability_type', parseInt(v))} onBlur={onBlur} disabled={disabled} options={LIABILITY_TYPES} />
            </Field>
            <Field label="Description">
              <Input value={l.finance_liability_description} onChange={v => upLiab(idx, 'finance_liability_description', v)} onBlur={onBlur} placeholder="e.g. Visa credit card" disabled={disabled} />
            </Field>
            <Field label="Limit ($)">
              <CurrencyInput value={l.finance_liability_limit} onChange={v => upLiab(idx, 'finance_liability_limit', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
            <Field label="Balance ($)">
              <CurrencyInput value={l.finance_liability_balance} onChange={v => upLiab(idx, 'finance_liability_balance', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
            {!disabled && <RemoveRowButton onClick={() => removeLiab(idx)} />}
          </div>
        ))}
        {!disabled && <AddRowButton onClick={addLiab} label="+ Add liability" />}
      </Card>
    </div>
  )
}

// ─── PAGE 4: Property Preferences ────────────────────────────────────────────

export function PropertyPage({ formData, onChange, onBlur, disabled }) {
  const pp = formData.property.property_list[0] || {}

  const upP = (key, val) => {
    const newList = setArr(formData.property.property_list, 0, key, val)
    onChange(set(formData, 'property.property_list', newList))
  }

  return (
    <div>
      <Card>
        <SectionHead eyebrow="Applicant 1" title="Property knowledge and preferences" />

        <SectionLabel>1. How familiar are you with residential property investment markets?</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 4 }}>
          {MARKET_FAMILIARITY.map(opt => (
            <ChoiceRow
              key={opt.value}
              label={opt.label}
              selected={pp.property_q_1_familar === opt.value}
              onSelect={() => upP('property_q_1_familar', opt.value)}
              disabled={disabled}
            />
          ))}
        </div>

        <Divider />
        <SectionLabel>2. Expected capital growth per annum over 10 years?</SectionLabel>
        <ChipGroup options={EXPECTED_GROWTH} value={pp.property_q_2_growth} onChange={v => upP('property_q_2_growth', v)} disabled={disabled} />

        <Divider />
        <SectionLabel>3. If your property was not growing in value, how long would you wait before selling?</SectionLabel>
        <ChipGroup options={WAIT_BEFORE_SELLING} value={pp.property_q_3_wait} onChange={v => upP('property_q_3_wait', v)} disabled={disabled} />

        <Divider />
        <Grid>
          <div>
            <SectionLabel>4. Do you have a preference for property type?</SectionLabel>
            <ToggleBar
              options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
              value={pp.property_q_4_type_preferences}
              onChange={v => upP('property_q_4_type_preferences', v)}
              disabled={disabled}
              width={160}
            />
          </div>
          <div>
            <SectionLabel>5. Do you have a preference for location?</SectionLabel>
            <ToggleBar
              options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
              value={pp.property_q_5_location_preference}
              onChange={v => upP('property_q_5_location_preference', v)}
              disabled={disabled}
              width={160}
            />
          </div>
        </Grid>

        {(pp.property_q_4_type_preferences === 'Yes' || pp.property_q_5_location_preference === 'Yes') && (
          <Grid style={{ marginTop: 10 }}>
            {pp.property_q_4_type_preferences === 'Yes' && (
              <Field label="Preferred property type(s)">
                <Input value={pp.property_q_4_types_of_investment} onChange={v => upP('property_q_4_types_of_investment', v)} onBlur={onBlur} placeholder="e.g. House, TownHouse" disabled={disabled} />
              </Field>
            )}
            {pp.property_q_5_location_preference === 'Yes' && (
              <Field label="Preferred location / states">
                <Input value={pp.property_q_5_preference_location_states} onChange={v => upP('property_q_5_preference_location_states', v)} onBlur={onBlur} placeholder="e.g. QLD, NSW" disabled={disabled} />
              </Field>
            )}
          </Grid>
        )}

        <Divider />
        <Grid>
          <div>
            <SectionLabel>6. How important are taxation benefits to you?</SectionLabel>
            <ChipGroup options={TAXATION_IMPORTANCE} value={pp.property_q_6_taxation} onChange={v => upP('property_q_6_taxation', v)} disabled={disabled} />
          </div>
          <div>
            <SectionLabel>7. Are you familiar with negative gearing?</SectionLabel>
            <ToggleBar
              options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]}
              value={pp.property_q_7_gearing}
              onChange={v => upP('property_q_7_gearing', v)}
              disabled={disabled}
              width={160}
            />
          </div>
        </Grid>

        {/* Temporarily hidden — partner's different views in Property Knowledge
        {!disabled && (
          <div style={{ marginTop: 12 }}>
            <AddRowButton label="+ Add partner's different views (if applicable)" orange />
          </div>
        )}
        */}
      </Card>
    </div>
  )
}

// ─── PAGE 5: AML/KYC (advisor only) ──────────────────────────────────────────

export function AmlPage({ formData, onChange, onBlur, amlStatus, onAmlStatusChange, clientId, token, advisorName, disabled }) {
  const aml = formData.aml

  const upA = (key, val) => onChange(set(formData, `aml.${key}`, val))

  // Pre-fill advisor fields from context: advisor name from the URL param,
  // meeting date defaulting to today. Only seed empties so manual edits stick.
  React.useEffect(() => {
    if (disabled) return
    let next = formData
    if (!aml.advisor_name && advisorName) {
      next = set(next, 'aml.advisor_name', advisorName)
    }
    if (!aml.meeting_date) {
      next = set(next, 'aml.meeting_date', new Date().toISOString().slice(0, 10))
    }
    if (next !== formData) onChange(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advisorName, disabled])

  // ── Document upload (client_aml_documents) ──────────────────────────────────
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState(null)
  const [uploadDocType, setUploadDocType] = React.useState('')
  const documents = amlStatus?.documents || []

  const handleUpload = async (file, docType) => {
    if (!file || !clientId || !token) return
    setUploading(true)
    setUploadError(null)
    try {
      await uploadAmlDocument(clientId, file, docType, token)
      // Refresh status to pick up the newly stored document
      const refreshed = await getAmlStatus(clientId, token)
      onAmlStatusChange?.(refreshed?.data || refreshed)
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // ── Electronic verification (FrankieOne via PIERS /aml/check + /aml/status) ──
  const [verifying, setVerifying] = React.useState(false)
  const [verifyError, setVerifyError] = React.useState(null)
  const pollRef = React.useRef(null)

  // Stop polling on unmount
  React.useEffect(() => () => clearInterval(pollRef.current), [])

  const refreshAmlStatus = async () => {
    try {
      const res = await getAmlStatus(clientId, token)
      onAmlStatusChange?.(res?.data || res)
      return res?.data || res
    } catch {
      return null
    }
  }

  const handleRunVerification = async () => {
    if (!clientId || !token || verifying) return
    setVerifying(true)
    setVerifyError(null)
    try {
      await initiateAmlCheck(clientId, token)
      // Poll status until FrankieOne returns a terminal result (or we give up).
      let attempts = 0
      clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        attempts++
        const status = await refreshAmlStatus()
        const s = (status?.status || '').toUpperCase()
        if (s === 'VERIFIED' || s === 'FAILED' || s === 'EXPIRED' || attempts >= 20) {
          clearInterval(pollRef.current)
          setVerifying(false)
        }
      }, 3000)
    } catch (err) {
      setVerifyError(err.message || 'Verification could not be started. The service may not be available yet.')
      setVerifying(false)
    }
  }

  const pepOptions = [
    { value: 'not_pep', label: 'Not a PEP', desc: 'No current or former prominent public position' },
    { value: 'pep_domestic', label: 'PEP — domestic', desc: 'Holds or held a prominent position in Australia' },
    { value: 'pep_foreign', label: 'PEP — foreign', desc: 'Holds or held a prominent position overseas' },
    { value: 'pep_associate', label: 'PEP — associate', desc: 'Close family member or known associate of a PEP' },
  ]

  const riskOptions = [
    { value: 'low', label: 'Low', desc: 'Australian resident, verifiable income, no PEP indicators. Standard CDD sufficient.' },
    { value: 'medium', label: 'Medium', desc: 'Self-employed, overseas funds or minor PEP indicators. Enhanced source of funds required.' },
    { value: 'high', label: 'High', desc: 'PEP confirmed, TFS flags, high-risk jurisdiction or unusual transaction. EDD required.' },
  ]

  const riskBadgeColour = { low: C.green, medium: C.amber, high: C.red }

  return (
    <div>
      <Banner type="blue" icon="ℹ">
        Required by law under the <em>AML/CTF Act 2006</em> (Cth). Identity documents must be
        sighted and recorded before providing any designated service. This section is{' '}
        <strong>advisor use only</strong> and is not visible to the client.
      </Banner>

      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {amlStatus && (
          <>
            <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'Poppins, sans-serif' }}>AML/CTF Status:</span>
            <AmlBadge status={amlStatus.status} />
          </>
        )}
        {/* Temporarily disabled — electronic verification (FrankieOne) not live yet
        {!disabled && (
          <Button onClick={handleRunVerification} disabled={verifying || !clientId || !token} style={{ marginLeft: 'auto' }}>
            {verifying ? 'Verifying…' : 'Run electronic verification (FrankieOne)'}
          </Button>
        )}
        */}
      </div>
      {verifyError && (
        <Banner type="orange" icon="⚠">{verifyError}</Banner>
      )}

      {/* KYC Identity */}
      <Card aml>
        <SectionHead eyebrow="KYC — Identity documents" title="Primary photo ID sighted" aml />
        <Grid cols={3}>
          <Field label="Document type">
            <Select value={aml.id_doc_type} onChange={v => upA('id_doc_type', v)} onBlur={onBlur} disabled={disabled}
              options={['Australian passport', 'Foreign passport', 'Driver licence (Aus)', 'Driver licence (foreign)']} />
          </Field>
          <Field label="Document number">
            <Input value={aml.id_doc_number} onChange={v => upA('id_doc_number', v)} onBlur={onBlur} placeholder="e.g. PA1234567" disabled={disabled} />
          </Field>
          <Field label="Expiry date">
            <Input type="date" value={aml.id_doc_expiry} onChange={v => upA('id_doc_expiry', v)} onBlur={onBlur} disabled={disabled} />
          </Field>
        </Grid>
        <Grid style={{ marginTop: 8 }}>
          <Field label="Issuing authority / country">
            <Input value={aml.id_issuing_authority} onChange={v => upA('id_issuing_authority', v)} onBlur={onBlur} placeholder="e.g. Australia / NSW" disabled={disabled} />
          </Field>
          <Field label="Name on document matches?">
            <Select value={aml.id_name_matches} onChange={v => upA('id_name_matches', v)} onBlur={onBlur} disabled={disabled}
              options={['Yes — exact match', 'Yes — with explanation', 'No — cannot verify']} />
          </Field>
        </Grid>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10,
          color: '#3B6D11', background: C.greenLight, border: `0.5px solid ${C.green}`,
          borderRadius: 20, padding: '3px 8px', marginTop: 8, fontFamily: 'Poppins, sans-serif', fontWeight: 500,
        }}>
          ✓ DVS electronic verification recommended
        </div>
        <Divider />
        <SectionLabel>Secondary / supporting document</SectionLabel>
        <Grid>
          <Field label="Document type">
            <Select value={aml.id_secondary_type} onChange={v => upA('id_secondary_type', v)} onBlur={onBlur} disabled={disabled}
              options={['Medicare card', 'ATO notice (past 12 months)', 'Rates notice (past 12 months)', 'Utility bill (past 3 months)', 'Birth certificate', 'Other']} />
          </Field>
          <Field label="Verification method">
            <Select value={aml.id_verification_method} onChange={v => upA('id_verification_method', v)} onBlur={onBlur} disabled={disabled}
              options={['Original documents — sighted in person', 'Certified copies received', 'Electronic — DVS', 'Electronic — third-party service']} />
          </Field>
        </Grid>
        <Field label="Date verified" style={{ marginTop: 8, maxWidth: 180 }}>
          <Input type="date" value={aml.id_verified_date} onChange={v => upA('id_verified_date', v)} onBlur={onBlur} disabled={disabled} />
        </Field>

        <Divider />
        <SectionLabel>Uploaded ID documents</SectionLabel>
        {documents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {documents.map((doc, idx) => (
              <div key={doc.id ?? idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                background: C.bgField, border: `0.5px solid ${C.border}`, borderRadius: 8, padding: '7px 11px',
              }}>
                <span style={{ fontSize: 11, color: C.textPrimary, fontFamily: 'Poppins, sans-serif' }}>
                  📎 {doc.document_type || doc.type || 'Document'}
                  {doc.file_name ? ` — ${doc.file_name}` : ''}
                </span>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10, color: C.teal, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 11, color: C.textSecondary, marginBottom: 10, fontFamily: 'Poppins, sans-serif' }}>
            No documents uploaded yet.
          </p>
        )}
        {!disabled && (
          <Grid>
            <Field label="Document type to upload">
              <Select value={uploadDocType} onChange={setUploadDocType} disabled={uploading}
                options={['Primary photo ID', 'Secondary document', 'Proof of address', 'Source of funds evidence', 'Other']} />
            </Field>
            <Field label="Select file">
              <input
                type="file"
                disabled={uploading || !uploadDocType}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file, uploadDocType)
                  e.target.value = ''  // allow re-selecting the same file
                }}
                style={{ fontSize: 11, fontFamily: 'Poppins, sans-serif', color: C.textSecondary }}
              />
              {!uploadDocType && (
                <span style={{ fontSize: 10, color: C.textMuted, fontFamily: 'Poppins, sans-serif' }}>
                  Choose a document type first to enable upload.
                </span>
              )}
            </Field>
          </Grid>
        )}
        {uploading && (
          <p style={{ fontSize: 11, color: C.textSecondary, marginTop: 6, fontFamily: 'Poppins, sans-serif' }}>
            Uploading…
          </p>
        )}
        {uploadError && (
          <p style={{ fontSize: 11, color: C.red, marginTop: 6, fontFamily: 'Poppins, sans-serif' }}>
            {uploadError}
          </p>
        )}
      </Card>

      {/* PEP & Sanctions */}
      <Card aml>
        <SectionHead eyebrow="AML/CTF — PEP & Sanctions screening" title="Politically Exposed Person (PEP) check" aml />
        <p style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.7, marginBottom: 10, fontFamily: 'Poppins, sans-serif' }}>
          A PEP holds or has held a prominent public position (e.g. politician, judge, senior
          government official) or is a close family member or associate of such a person.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {pepOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => !disabled && upA('pep_status', opt.value)}
              style={{
                border: `1.5px solid ${aml.pep_status === opt.value ? C.orange : C.border}`,
                background: aml.pep_status === opt.value ? 'rgba(208,90,0,0.06)' : C.bgCard,
                borderRadius: 8, padding: '8px 10px', cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 2, fontFamily: 'Poppins, sans-serif' }}>{opt.label}</div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.4, fontFamily: 'Poppins, sans-serif' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        <Grid style={{ marginTop: 10 }}>
          <Field label="Targeted Financial Sanctions (TFS) — is client listed?">
            <Select value={aml.tfs_status} onChange={v => upA('tfs_status', v)} onBlur={onBlur} disabled={disabled}
              options={['No — confirmed not listed', 'Yes — listed (do not proceed, file SMR)', 'Unable to determine']} />
          </Field>
          <Field label="Sanctions screening date & service used">
            <Input value={aml.tfs_screening_date} onChange={v => upA('tfs_screening_date', v)} onBlur={onBlur} placeholder="e.g. 18 Mar 2026 — DFAT Consolidated List" disabled={disabled} />
          </Field>
        </Grid>
      </Card>

      {/* Source of funds */}
      <Card aml>
        <SectionHead eyebrow="AML/CTF — Source of funds & wealth" title="How will this investment be funded?" aml />
        <Grid>
          <Field label="Primary source of investment funds">
            <Select value={aml.source_of_funds} onChange={v => upA('source_of_funds', v)} onBlur={onBlur} disabled={disabled}
              options={['Employment income / savings', 'Equity in existing property', 'Superannuation', 'Inheritance / gift', 'Business income / sale', 'Sale of assets', 'Overseas funds', 'Other']} />
          </Field>
          <Field label="Source of overall wealth">
            <Select value={aml.source_of_wealth} onChange={v => upA('source_of_wealth', v)} onBlur={onBlur} disabled={disabled}
              options={['Lifetime employment / savings', 'Property ownership', 'Business ownership / sale', 'Inheritance', 'Investments', 'Other']} />
          </Field>
          <Field label="Nature and purpose of relationship">
            <Select value={aml.relationship_purpose} onChange={v => upA('relationship_purpose', v)} onBlur={onBlur} disabled={disabled}
              options={['Prepare PIEP — property investment planning', 'Ongoing advisory / portfolio management', 'One-off property evaluation', 'Other']} />
          </Field>
          <Field label="Estimated purchase value">
            <Select value={aml.estimated_purchase_value} onChange={v => upA('estimated_purchase_value', v)} onBlur={onBlur} disabled={disabled}
              options={['Under $500,000', '$500k–$750k', '$750k–$1m', '$1m–$2m', 'Over $2m']} />
          </Field>
        </Grid>
        <Field label="Further detail on source of funds (required for PEPs and high-risk clients)" style={{ marginTop: 8 }}>
          <Textarea value={aml.source_of_funds_detail} onChange={v => upA('source_of_funds_detail', v)} onBlur={onBlur}
            placeholder="e.g. Savings accumulated over 15 years of employment. Property equity from home purchased in 2010…" disabled={disabled} />
        </Field>
      </Card>

      {/* ML/TF Risk Rating */}
      <Card aml>
        <SectionHead eyebrow="AML/CTF — ML/TF risk rating" title="Customer risk assessment" aml />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
          {riskOptions.map(opt => (
            <div
              key={opt.value}
              onClick={() => !disabled && upA('ml_tf_risk_rating', opt.value)}
              style={{
                border: `1.5px solid ${aml.ml_tf_risk_rating === opt.value ? C.teal : C.border}`,
                background: aml.ml_tf_risk_rating === opt.value ? 'rgba(0,107,107,0.07)' : C.bgCard,
                borderRadius: 8, padding: 8, cursor: disabled ? 'not-allowed' : 'pointer',
                textAlign: 'center', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 3, fontFamily: 'Poppins, sans-serif' }}>{opt.label}</div>
              <div style={{ fontSize: 10, color: C.textSecondary, lineHeight: 1.4, fontFamily: 'Poppins, sans-serif' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        {aml.ml_tf_risk_rating && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px',
            borderRadius: 20, fontSize: 11, fontWeight: 500, fontFamily: 'Poppins, sans-serif',
            background: aml.ml_tf_risk_rating === 'low' ? C.greenLight : aml.ml_tf_risk_rating === 'high' ? C.redLight : C.amberLight,
            color: riskBadgeColour[aml.ml_tf_risk_rating],
            border: `0.5px solid ${riskBadgeColour[aml.ml_tf_risk_rating]}`,
          }}>
            ● {aml.ml_tf_risk_rating === 'low' ? 'Low — standard CDD sufficient'
              : aml.ml_tf_risk_rating === 'high' ? 'High — Enhanced CDD required. Do not proceed without EDD completion.'
              : 'Medium — standard CDD + enhanced source of funds verification required'}
          </div>
        )}
      </Card>

      {/* Contemporaneous Notes */}
      <div style={{
        background: C.bgCard, borderRadius: 12,
        border: `1px dashed ${C.borderMid}`, padding: '14px 16px', marginBottom: 12,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: C.dark,
          borderRadius: 8, padding: '7px 10px', marginBottom: 12,
          fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins, sans-serif',
        }}>
          🔒 <span><strong style={{ color: C.white }}>Contemporaneous Notes — Advisor Use Only.</strong> Not shown to client. Retained as compliance record.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Field label="Identity consistent with documents? Note any discrepancies.">
            <Textarea value={aml.notes_identity} onChange={v => upA('notes_identity', v)} onBlur={onBlur}
              placeholder="e.g. All documents sighted. Passport photo matches. DVS check returned clear…" disabled={disabled} />
          </Field>
          <Field label="Any suspicious or inconsistent information about source of funds?">
            <Textarea value={aml.notes_source_of_funds} onChange={v => upA('notes_source_of_funds', v)} onBlur={onBlur}
              placeholder="e.g. No concerns identified…" disabled={disabled} />
          </Field>
          <Field label="Goals realistic given financial position? Note concerns.">
            <Textarea value={aml.notes_goals_realistic} onChange={v => upA('notes_goals_realistic', v)} onBlur={onBlur}
              placeholder="e.g. Goals ambitious — may need staged strategy…" disabled={disabled} />
          </Field>
          <Field label="SMR trigger identified? (Do NOT inform client — tipping-off offence applies)">
            <Select value={aml.smr_status} onChange={v => upA('smr_status', v)} onBlur={onBlur} disabled={disabled}
              options={[
                { value: 'no_smr', label: 'No — no suspicious indicators identified' },
                { value: 'smr_filed', label: 'Yes — SMR filed with AUSTRAC (record reference below)' },
                { value: 'under_review', label: 'Under review — seeking guidance' },
              ]} />
          </Field>
          {aml.smr_status === 'smr_filed' && (
            <Field label="SMR reference number">
              <Input value={aml.smr_reference} onChange={v => upA('smr_reference', v)} onBlur={onBlur} placeholder="AUSTRAC reference" disabled={disabled} />
            </Field>
          )}
          <Grid>
            <Field label="Advisor name">
              <Input value={aml.advisor_name} onChange={v => upA('advisor_name', v)} onBlur={onBlur} placeholder="Full name" disabled={disabled} />
            </Field>
            <Field label="Date of meeting">
              <Input type="date" value={aml.meeting_date} onChange={v => upA('meeting_date', v)} onBlur={onBlur} disabled={disabled} />
            </Field>
          </Grid>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE 6 (client) / 6 (advisor): Finish ───────────────────────────────────

export function FinishPage({ formData, onChange, onSubmit, submitting, submitError, pdfUrl, disabled }) {
  const { consent } = formData

  return (
    <div>
      <Card>
        <SectionHead eyebrow="Declaration" title="Client declaration" />
        <p style={{ fontSize: 11.5, color: C.textSecondary, lineHeight: 1.7, marginBottom: 10, fontFamily: 'Poppins, sans-serif' }}>
          By submitting this form I declare that the information provided is true, correct and complete
          to the best of my knowledge. I understand my advisor relies on this information and that
          providing false or misleading information is an offence under the{' '}
          <em>Anti-Money Laundering and Counter-Terrorism Financing Act 2006</em> (Cth).
        </p>
        <ConsentRow
          checked={consent.privacy}
          onChange={v => onChange(set(formData, 'consent.privacy', v))}
          disabled={disabled}
        >
          <strong>I confirm all information is accurate and complete.</strong>{' '}
          I understand this is not financial product advice and I am encouraged to seek independent
          legal, financial and taxation advice. I consent to identity verification as required by
          the AML/CTF Act.
        </ConsentRow>
      </Card>

      {submitError && (
        <Banner type="red" icon="✕">
          <strong>Submission error:</strong> {submitError}. Please try again or contact your advisor.
        </Banner>
      )}

      {pdfUrl ? (
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.greenLight, border: `2px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>
            ✓
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C.textPrimary, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>
            Thank you — your fact find is complete!
          </div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.7, marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>
            Your advisor will be in touch to discuss your Property Investment Evaluation Plan.
          </div>
          <a href={pdfUrl} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 22px', borderRadius: 8, background: C.teal,
            color: C.white, fontSize: 13, fontFamily: 'Poppins, sans-serif',
            fontWeight: 600, textDecoration: 'none',
          }}>
            ↓ Download PDF copy
          </a>
          <div style={{ background: C.bgCard, borderRadius: 12, border: `0.5px solid ${C.border}`, padding: '14px 16px', textAlign: 'left', marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, marginBottom: 8, fontFamily: 'Poppins, sans-serif' }}>What happens next?</div>
            {[
              'A copy of your completed fact find has been sent to your advisor.',
              'Your advisor will contact you to discuss your Property Investment Evaluation Plan (PIEP).',
              'If you need to amend any information your advisor can unlock the form for revision.',
              'Once your PIEP is finalised you will receive a copy for your records.',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 11.5, color: C.textSecondary, fontFamily: 'Poppins, sans-serif' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.teal, color: C.white, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Button
            primary
            onClick={onSubmit}
            disabled={!consent.privacy || disabled || submitting}
            loading={submitting}
            style={{ minWidth: 180 }}
          >
            Submit fact find →
          </Button>
          {!consent.privacy && (
            <p style={{ fontSize: 11, color: C.textMuted, marginTop: 8, fontFamily: 'Poppins, sans-serif' }}>
              Please confirm the declaration above before submitting.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
