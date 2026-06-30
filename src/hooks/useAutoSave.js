import { useEffect, useRef, useCallback } from 'react'
import { saveDraft } from '../utils/api.js'

const AUTO_SAVE_INTERVAL = parseInt(import.meta.env.VITE_AUTO_SAVE_INTERVAL || '30000')
const MAX_RETRIES = 3

/**
 * useAutoSave
 * - Saves on field blur (call triggerSave() from onBlur handlers)
 * - Saves every AUTO_SAVE_INTERVAL ms of inactivity
 * - Saves on page unload via navigator.sendBeacon
 * - Retries failed saves with exponential backoff (max 3 attempts)
 * - Handles 409 conflict by calling onConflict callback
 */
export function useAutoSave({
  clientId,
  token,
  formData,
  updatedAt,
  onSaved,     // (savedAt: string) => void
  onConflict,  // (conflictInfo) => void
  onError,     // (err) => void
  enabled = true,
}) {
  const pendingRef = useRef(false)
  const retryCountRef = useRef(0)
  const timerRef = useRef(null)
  const formDataRef = useRef(formData)
  const updatedAtRef = useRef(updatedAt)

  // Keep refs in sync with latest state
  useEffect(() => { formDataRef.current = formData }, [formData])
  useEffect(() => { updatedAtRef.current = updatedAt }, [updatedAt])

  const doSave = useCallback(async () => {
    if (!enabled || !clientId || !token) return
    if (pendingRef.current) return

    pendingRef.current = true

    try {
      const result = await saveDraft(
        clientId,
        formDataRef.current,
        updatedAtRef.current,
        token
      )
      retryCountRef.current = 0
      onSaved?.(result.saved_at)
    } catch (err) {
      if (err.status === 409) {
        // Conflict — another user saved a newer version
        onConflict?.(err.body)
      } else if (retryCountRef.current < MAX_RETRIES) {
        // Retry with exponential backoff
        retryCountRef.current++
        const delay = Math.pow(2, retryCountRef.current) * 1000
        setTimeout(() => {
          pendingRef.current = false
          doSave()
        }, delay)
        return
      } else {
        retryCountRef.current = 0
        onError?.(err)
      }
    } finally {
      pendingRef.current = false
    }
  }, [clientId, token, enabled, onSaved, onConflict, onError])

  // Interval-based auto-save
  useEffect(() => {
    if (!enabled) return
    timerRef.current = setInterval(doSave, AUTO_SAVE_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [doSave, enabled])

  // beforeunload — attempt final save via sendBeacon
  useEffect(() => {
    if (!enabled) return

    const handleUnload = () => {
      if (!clientId || !token) return
      const payload = JSON.stringify({
        form_data: formDataRef.current,
        updated_at: updatedAtRef.current,
      })
      // sendBeacon fires even during page unload
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL || 'https://piers.forrestercohen.com'}/api/factfind/${clientId}/draft`,
        new Blob([payload], { type: 'application/json' })
      )
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [clientId, token, enabled])

  // Expose manual trigger (call on field blur)
  return { triggerSave: doSave }
}
