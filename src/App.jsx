import React, { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import {
  StartPage, PersonalPage, GoalsPage, FinancePage, PropertyPage, AmlPage, FinishPage,
} from './components/Pages.jsx'
import { C, LoadingSkeleton, Banner, Button } from './components/UI.jsx'
import { useUrlParams } from './hooks/useUrlParams.js'
import { useAutoSave } from './hooks/useAutoSave.js'
import { getClient, getFactFind, getAmlStatus, generatePdf, submitFactFind } from './utils/api.js'
import { mapClientToForm, buildSubmitPayload, emptyFormData } from './utils/mapper.js'

// ─── Page definitions (client vs advisor) ────────────────────────────────────
const CLIENT_PAGES = ['start', 'personal', 'goals', 'finance', 'property', 'finish']
const ADVISOR_PAGES = ['start', 'personal', 'goals', 'finance', 'property', 'aml', 'finish']

// ─── States where client cannot edit ─────────────────────────────────────────
const CLIENT_READONLY_STATES = ['SUBMITTED', 'IN_REVIEW', 'LOCKED', 'COMPLETED']
const ADVISOR_READONLY_STATES = ['LOCKED', 'COMPLETED']

export default function App() {
  const { clientId, token, role, userId, specialistId, companyName, companyAbn, advisorName } = useUrlParams()

  // ── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(emptyFormData())
  const [meta, setMeta] = useState({
    status: 'DRAFT',
    locked: false,
    locked_by: null,
    updated_at: null,
    advisor_notes: [],
  })
  const [amlStatus, setAmlStatus] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [savedAt, setSavedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [conflictInfo, setConflictInfo] = useState(null)

  // Set document title with company branding
  useEffect(() => {
    document.title = companyName
      ? `${companyName} · Property Risk Fact Find`
      : 'Property Risk Fact Find'
  }, [companyName])

  const pages = role === 'advisor' ? ADVISOR_PAGES : CLIENT_PAGES
  const isReadOnly = role === 'client'
    ? CLIENT_READONLY_STATES.includes(meta.status)
    : ADVISOR_READONLY_STATES.includes(meta.status)

  // ── Initial data load ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!clientId || !token) {
      setError('Missing client ID or authentication token. Please use the link provided by your advisor.')
      setLoading(false)
      return
    }

    async function load() {
      try {
        // 1. Fetch client record (existing endpoint — always available)
        const clientRes = await getClient(clientId, token)
        const client = clientRes?.data || clientRes || {}

        // 2. Try to fetch fact find state (new endpoint — may not exist yet).
        //    This carries the saved draft form_data (incl. advisor-only AML fields).
        let factFind = null
        try {
          const ffRes = await getFactFind(clientId, token)
          const ff = ffRes?.data || ffRes
          factFind = ff
          setMeta({
            status: ff.status || 'DRAFT',
            locked: ff.locked || false,
            locked_by: ff.locked_by || null,
            updated_at: ff.updated_at || null,
            advisor_notes: ff.advisor_notes || [],
          })
        } catch {
          // Fact find endpoint not yet deployed — use client data only, status = DRAFT
        }

        // Map once from the merged source so the saved draft's form_data
        // (which holds AML and any other draft-only fields) is applied on reload.
        const mapped = mapClientToForm({
          ...client,
          ...(factFind || {}),
          form_data: factFind?.form_data || client.form_data,
        })
        setFormData(mapped)

        // 3. Fetch AML status (advisor only)
        if (role === 'advisor') {
          try {
            const amlRes = await getAmlStatus(clientId, token)
            setAmlStatus(amlRes?.data || amlRes)
          } catch {
            // AML endpoint not yet deployed — no status to show
          }
        }
      } catch (err) {
        if (err.status === 401) {
          setError('Your session has expired or your link is invalid. Please request a new link from your advisor.')
        } else if (err.status === 403) {
          setError('You do not have permission to access this record.')
        } else if (err.status === 404) {
          setError('Client record not found. Please check your link or contact your advisor.')
        } else {
          setError(`Unable to load your fact find. Please try again or contact support. (${err.message})`)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [clientId, token, role])

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const { triggerSave } = useAutoSave({
    clientId,
    token,
    formData,
    updatedAt: meta.updated_at,
    enabled: !loading && !isReadOnly && !!clientId && !!token,
    onSaved: (at) => {
      setSavedAt(at)
      setSaving(false)
    },
    onConflict: (info) => {
      setSaving(false)
      setConflictInfo(info)
    },
    onError: () => {
      setSaving(false)
    },
  })

  const handleChange = useCallback((newFormData) => {
    setFormData(newFormData)
  }, [])

  const handleBlur = useCallback(() => {
    if (!isReadOnly) {
      setSaving(true)
      triggerSave()
    }
  }, [isReadOnly, triggerSave])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      // 1. Submit status change
      try {
        await submitFactFind(clientId, token)
      } catch {
        // submitFactFind endpoint may not exist yet — proceed to PDF
      }

      // 2. Generate PDF (existing endpoint)
      const payload = buildSubmitPayload(
        parseInt(clientId),
        userId ? parseInt(userId) : 1,
        specialistId ? parseInt(specialistId) : 1,
        formData
      )
      const result = await generatePdf(payload, token)

      if (result?.pdf_url) {
        const base = import.meta.env.VITE_API_URL || 'https://piers.forrestercohen.com'
        setPdfUrl(result.pdf_url.startsWith('http') ? result.pdf_url : `${base}${result.pdf_url}`)
        setMeta(m => ({ ...m, status: 'SUBMITTED' }))
      }
    } catch (err) {
      setSubmitError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }, [clientId, token, userId, specialistId, formData])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigate = useCallback((dir) => {
    setCurrentStep(s => Math.max(0, Math.min(pages.length - 1, s + dir)))
    window.scrollTo(0, 0)
  }, [pages.length])

  const goToStep = useCallback((idx) => {
    // Block navigation past start page until privacy consent is given
    if (idx > 0 && !formData.consent.privacy) return
    setCurrentStep(idx)
    window.scrollTo(0, 0)
  }, [formData.consent.privacy])

  // ── Render: loading / error states ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20 }}>
        <div style={{ background: C.bgCard, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,107,107,0.10)' }}>
          <div style={{ background: C.teal, height: 80, borderRadius: '12px 12px 0 0' }} />
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: '40px auto', padding: 20 }}>
        <Banner type="red" icon="✕">
          <strong>Unable to load your fact find.</strong><br />
          {error}
        </Banner>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    )
  }

  const currentPage = pages[currentStep]
  const isLastStep = currentStep === pages.length - 1
  const navLabels = {
    start: 'Personal information',
    personal: 'Goals',
    goals: 'Finance',
    finance: 'Property',
    property: role === 'advisor' ? 'AML / KYC' : 'Review & finish',
    aml: 'Review & finish',
    finish: 'Submit',
  }

  return (
    <div style={{ padding: '20px 16px', minHeight: '100vh' }}>
      <div style={{
        maxWidth: 720, margin: '0 auto',
        background: C.bgPage,
        borderRadius: 14,
        boxShadow: '0 4px 24px rgba(0,107,107,0.10)',
        overflow: 'hidden',
      }}>
        <Header
          currentStep={currentStep}
          onStepClick={goToStep}
          status={meta.status}
          savedAt={savedAt}
          saving={saving}
          role={role}
          companyName={companyName}
          advisorName={advisorName}
        />

        {/* Conflict resolution banner */}
        {conflictInfo && (
          <div style={{ padding: '0 22px', marginTop: 12 }}>
            <Banner type="orange" icon="⚠">
              <strong>Conflict detected:</strong> This form was updated by {conflictInfo.modified_by?.name} at {new Date(conflictInfo.server_updated_at).toLocaleTimeString()}.{' '}
              <button
                onClick={() => { setConflictInfo(null); window.location.reload() }}
                style={{ color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'Poppins, sans-serif', textDecoration: 'underline' }}
              >
                Reload their version
              </button>{' '}or continue editing to overwrite.
            </Banner>
          </div>
        )}

        {/* Locked banner */}
        {isReadOnly && meta.status !== 'DRAFT' && (
          <div style={{ padding: '0 22px', marginTop: 12 }}>
            <Banner type="blue" icon="🔒">
              {meta.status === 'LOCKED'
                ? `This form is locked${meta.locked_by ? ` by ${meta.locked_by}` : ''}. Contact your advisor to make changes.`
                : meta.status === 'SUBMITTED'
                ? 'Your fact find has been submitted and is being reviewed by your advisor.'
                : meta.status === 'COMPLETED'
                ? 'This fact find has been completed and archived.'
                : 'This form is currently read-only.'}
            </Banner>
          </div>
        )}

        {/* Page content */}
        <div style={{ padding: '18px 22px 14px' }}>
          {currentPage === 'start' && (
            <StartPage formData={formData} onChange={handleChange} disabled={isReadOnly} companyName={companyName} companyAbn={companyAbn} advisorName={advisorName} />
          )}
          {currentPage === 'personal' && (
            <PersonalPage formData={formData} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} />
          )}
          {currentPage === 'goals' && (
            <GoalsPage formData={formData} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} />
          )}
          {currentPage === 'finance' && (
            <FinancePage formData={formData} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} />
          )}
          {currentPage === 'property' && (
            <PropertyPage formData={formData} onChange={handleChange} onBlur={handleBlur} disabled={isReadOnly} />
          )}
          {currentPage === 'aml' && role === 'advisor' && (
            <AmlPage formData={formData} onChange={handleChange} onBlur={handleBlur} amlStatus={amlStatus} onAmlStatusChange={setAmlStatus} clientId={clientId} token={token} advisorName={advisorName} disabled={isReadOnly} />
          )}
          {currentPage === 'finish' && (
            <FinishPage
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
              pdfUrl={pdfUrl}
              disabled={isReadOnly && !!pdfUrl}
            />
          )}

          {/* Navigation footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 16, marginTop: 8,
            borderTop: `0.5px solid ${C.border}`,
          }}>
            <Button
              onClick={() => navigate(-1)}
              disabled={currentStep === 0}
              style={{ opacity: currentStep === 0 ? 0.4 : 1 }}
            >
              ← Back
            </Button>

            <span style={{ fontSize: 9.5, color: C.textMuted, fontFamily: 'Poppins, sans-serif' }}>
              © {companyName || 'PIERS TECH Pty Ltd'} · AML/CTF Act 2006 (Cth) · Privacy Act 1988 (Cth)
            </span>

            {!isLastStep ? (
              <div style={{ textAlign: 'right' }}>
                <Button
                  primary
                  onClick={() => navigate(1)}
                  disabled={currentPage === 'start' && !formData.consent.privacy}
                >
                  {navLabels[currentPage] || 'Next'} →
                </Button>
                {currentPage === 'start' && !formData.consent.privacy && (
                  <p style={{ fontSize: 11, color: C.textMuted, marginTop: 6, fontFamily: 'Poppins, sans-serif' }}>
                    Please accept the Privacy Collection Notice to continue.
                  </p>
                )}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: C.teal, fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>
                {pdfUrl ? '✓ Complete' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
