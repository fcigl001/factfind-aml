// ─── PIERS API Client ─────────────────────────────────────────────────────────
// Auth: v1 pattern — JWT passed as Authorization: Bearer header
// Base: https://piers.forrestercohen.com

const BASE_URL = import.meta.env.VITE_API_URL || 'https://piers.forrestercohen.com'
const TIMEOUT_MS = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}, token = null) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Parse JSON regardless of status
    let body = null
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      body = await res.json()
    }

    if (!res.ok) {
      const err = new Error(body?.message || `HTTP ${res.status}`)
      err.status = res.status
      err.code = body?.error
      err.errors = body?.errors
      err.body = body
      throw err
    }

    return body
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      const timeout = new Error('Request timed out')
      timeout.status = 408
      throw timeout
    }
    throw err
  }
}

// ─── Client endpoints ─────────────────────────────────────────────────────────

/**
 * GET /api/clients/{clientId}
 * Fetches full client record including goals, assets, liabilities, property prefs.
 */
export async function getClient(clientId, token) {
  return request(`/api/clients/${clientId}`, {}, token)
}

// ─── Fact Find lifecycle endpoints ───────────────────────────────────────────

/**
 * GET /api/factfind/data/{clientId}
 * Returns current form state + metadata (status, locked, advisor notes).
 */
export async function getFactFind(clientId, token) {
  return request(`/api/factfind/data/${clientId}`, {}, token)
}

/**
 * PUT /api/factfind/{clientId}/draft
 * Auto-save without changing form status. Includes optimistic locking via updated_at.
 */
export async function saveDraft(clientId, formData, updatedAt, token) {
  return request(
    `/api/factfind/${clientId}/draft`,
    {
      method: 'PUT',
      body: JSON.stringify({ form_data: formData, updated_at: updatedAt }),
    },
    token
  )
}

/**
 * PATCH /api/factfind/{clientId}/section/{section}
 * Partial update — single section only.
 */
export async function saveSection(clientId, section, sectionData, token) {
  return request(
    `/api/factfind/${clientId}/section/${section}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ section_data: sectionData }),
    },
    token
  )
}

/**
 * POST /api/factfind/{clientId}/submit
 * Transitions status DRAFT → SUBMITTED. Notifies advisor.
 */
export async function submitFactFind(clientId, token) {
  return request(
    `/api/factfind/${clientId}/submit`,
    { method: 'POST' },
    token
  )
}

// ─── PDF generation (existing endpoint) ───────────────────────────────────────

/**
 * POST /api/generate-pdf
 * Generates the fact find PDF. Returns { pdf_url }.
 * Includes legacy root-level fields for backward compatibility.
 */
export async function generatePdf(payload, token) {
  return request(
    '/api/generate-pdf',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  )
}

// ─── AML/KYC endpoints (advisor only) ────────────────────────────────────────

/**
 * POST /api/clients/{clientId}/aml/check
 * Initiates AML identity verification.
 */
export async function initiateAmlCheck(clientId, token) {
  return request(
    `/api/clients/${clientId}/aml/check`,
    { method: 'POST' },
    token
  )
}

/**
 * GET /api/clients/{clientId}/aml/status
 * Returns current AML check status and document list.
 */
export async function getAmlStatus(clientId, token) {
  return request(`/api/clients/${clientId}/aml/status`, {}, token)
}

/**
 * POST /api/clients/{clientId}/aml/documents
 * Upload ID document for verification.
 */
export async function uploadAmlDocument(clientId, file, docType, token) {
  const formData = new FormData()
  formData.append('document', file)
  formData.append('type', docType)

  return request(
    `/api/clients/${clientId}/aml/documents`,
    {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set multipart boundary
    },
    token
  )
}

// ─── Advisor notes ────────────────────────────────────────────────────────────

/**
 * POST /api/factfind/{clientId}/notes
 */
export async function addNote(clientId, section, field, note, token) {
  return request(
    `/api/factfind/${clientId}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ section, field, note }),
    },
    token
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 */
export async function getNotifications(token) {
  return request('/api/notifications', {}, token)
}

/**
 * POST /api/notifications/{id}/read
 */
export async function markNotificationRead(id, token) {
  return request(`/api/notifications/${id}/read`, { method: 'POST' }, token)
}
