import { useMemo } from 'react'

/**
 * useUrlParams
 * Parses the v1 URL pattern: ?clientId=1303&token=eyJ...&role=advisor
 *
 * Returns:
 *   clientId  — string | null
 *   token     — string | null
 *   role      — "client" | "advisor" (defaults to "client" if absent)
 *   userId    — string | null
 *   specialistId — string | null
 */
export function useUrlParams() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      clientId: params.get('clientId') || params.get('client_id') || null,
      token: params.get('token') || null,
      role: (params.get('role') || 'client').toLowerCase(),
      userId: params.get('userId') || params.get('user_id') || null,
      specialistId: params.get('specialistId') || params.get('specialist_id') || null,
      companyName: params.get('companyName') || params.get('company_name') || null,
      companyAbn: params.get('companyAbn') || params.get('company_abn') || null,
      advisorName: params.get('advisorName') || params.get('advisor_name') || null,
    }
  }, [])
}
