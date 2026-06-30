import React, { useState, useCallback } from 'react'

// ─── Colour tokens ────────────────────────────────────────────────────────────
export const C = {
  teal: '#006B6B',
  orange: '#D05A00',
  dark: '#1A2E2E',
  white: '#ffffff',
  bgPage: '#f0f4f4',
  bgCard: '#ffffff',
  bgField: '#f5f9f9',
  border: '#c8dede',
  borderMid: '#8aadad',
  textPrimary: '#1A2E2E',
  textSecondary: '#4A6464',
  textMuted: '#7a9a9a',
  green: '#22a066',
  greenLight: '#EAF3DE',
  red: '#e05252',
  redLight: '#fff5f5',
  amber: '#854F0B',
  amberLight: '#FAEEDA',
  blue: '#4477CC',
  blueLight: '#EEF4FF',
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
export function Field({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...style }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 500, color: C.textSecondary,
          fontFamily: 'Poppins, sans-serif',
        }}>
          {label}
        </label>
      )}
      {children}
    </div>
  )
}

// ─── Text input ───────────────────────────────────────────────────────────────
export function Input({ value, onChange, onBlur, placeholder, type = 'text', disabled, style }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        background: C.bgField,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 12,
        fontFamily: 'Poppins, sans-serif',
        color: C.textPrimary,
        width: '100%',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    />
  )
}

// ─── Currency input (formatted $xx,xxx) ──────────────────────────────────────
export function CurrencyInput({ value, onChange, onBlur, placeholder = '$0', disabled, style }) {
  const [focused, setFocused] = useState(false)

  const rawNumber = typeof value === 'number' ? value : parseFloat(String(value).replace(/[$,\s]/g, '')) || 0

  const formatted = rawNumber
    ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(rawNumber)
    : ''

  const handleFocus = useCallback(() => setFocused(true), [])

  const handleBlur = useCallback(() => {
    setFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleChange = useCallback((e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    onChange?.(raw)
  }, [onChange])

  return (
    <input
      type="text"
      inputMode="decimal"
      value={focused ? (rawNumber || '') : formatted}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        background: C.bgField,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 12,
        fontFamily: 'Poppins, sans-serif',
        color: C.textPrimary,
        width: '100%',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    />
  )
}

// ─── Select / dropdown ────────────────────────────────────────────────────────
export function Select({ value, onChange, onBlur, options, placeholder = 'Select…', disabled, style }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      style={{
        background: C.bgField,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 12,
        fontFamily: 'Poppins, sans-serif',
        color: value ? C.textPrimary : C.textMuted,
        width: '100%',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      <option value=''>{placeholder}</option>
      {options.map(opt => (
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ value, onChange, onBlur, placeholder, rows = 3, disabled }) {
  return (
    <textarea
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      style={{
        background: C.bgField,
        border: `0.5px solid ${C.border}`,
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 12,
        fontFamily: 'Poppins, sans-serif',
        color: C.textPrimary,
        width: '100%',
        resize: 'vertical',
        outline: 'none',
        minHeight: 54,
        opacity: disabled ? 0.6 : 1,
      }}
    />
  )
}

// ─── Pill toggle buttons (employment type etc) ────────────────────────────────
export function PillGroup({ options, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
      {options.map(opt => {
        const isActive = value === opt.value || value === String(opt.value)
        return (
          <button
            key={opt.label}
            onClick={() => !disabled && onChange?.(opt.value)}
            disabled={disabled}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: `1.5px solid ${C.teal}`,
              background: isActive ? C.teal : 'transparent',
              color: isActive ? C.white : C.teal,
              fontSize: 12,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: isActive ? 600 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: disabled ? 0.5 : 1,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Binary toggle bar (Yes/No, Home/Investment, Fixed/Variable) ──────────────
export function ToggleBar({ options, value, onChange, disabled, width }) {
  return (
    <div style={{
      display: 'flex',
      border: `1.5px solid ${C.teal}`,
      borderRadius: 8,
      overflow: 'hidden',
      width: width || '100%',
    }}>
      {options.map((opt, i) => {
        const isActive = value === opt.value || value === String(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange?.(opt.value)}
            disabled={disabled}
            style={{
              flex: 1,
              padding: '7px 10px',
              fontSize: 12,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: isActive ? 600 : 500,
              background: isActive ? C.teal : 'transparent',
              color: isActive ? C.white : C.teal,
              border: 'none',
              borderLeft: i > 0 ? `1px solid ${C.teal}` : 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Chip selector (single-select chips) ─────────────────────────────────────
export function ChipGroup({ options, value, onChange, disabled }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map(opt => {
        const isActive = value === opt.value || value === String(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => !disabled && onChange?.(opt.value)}
            disabled={disabled}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: `1.5px solid ${C.teal}`,
              background: isActive ? C.teal : 'transparent',
              color: isActive ? C.white : C.teal,
              fontSize: 12,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: isActive ? 600 : 500,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              transition: 'background 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Radio choice row ─────────────────────────────────────────────────────────
export function ChoiceRow({ label, subLabel, selected, onSelect, disabled }) {
  return (
    <div
      onClick={() => !disabled && onSelect?.()}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '9px 12px',
        border: `0.5px solid ${selected ? C.teal : C.border}`,
        borderRadius: 8,
        background: selected ? 'rgba(0,107,107,0.06)' : C.bgCard,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Manually rendered radio — always reflects state, not browser */}
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: `2px solid ${selected ? C.teal : C.borderMid}`,
        background: selected ? C.teal : 'transparent',
        flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        {selected && (
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.white }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.textPrimary, lineHeight: 1.5, fontFamily: 'Poppins, sans-serif' }}>
          {label}
        </div>
        {subLabel && (
          <div style={{ fontSize: 10.5, color: C.textSecondary, marginTop: 2, fontFamily: 'Poppins, sans-serif' }}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Checkbox choice row (multi-select) ───────────────────────────────────────
export function CheckRow({ label, checked, onToggle, disabled }) {
  return (
    <div
      onClick={() => !disabled && onToggle?.()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        border: `0.5px solid ${checked ? C.teal : C.border}`,
        borderRadius: 8,
        background: checked ? 'rgba(0,107,107,0.06)' : C.bgCard,
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        transition: 'border-color 0.15s, background 0.15s',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4,
        border: `2px solid ${checked ? C.teal : C.borderMid}`,
        background: checked ? C.teal : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: 12, color: C.textPrimary, fontFamily: 'Poppins, sans-serif', lineHeight: 1.5 }}>
        {label}
      </span>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, aml, advisor }) {
  return (
    <div style={{
      background: C.bgCard,
      borderRadius: 12,
      border: aml
        ? `1px solid ${C.blue}`
        : advisor
        ? `1px dashed ${C.borderMid}`
        : `0.5px solid ${C.border}`,
      padding: '14px 16px',
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Section eyebrow + title ──────────────────────────────────────────────────
export function SectionHead({ eyebrow, title, aml }) {
  return (
    <>
      <div style={{
        fontSize: 8.5, fontWeight: 600, letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: aml ? C.blue : C.orange,
        marginBottom: 4, fontFamily: 'Poppins, sans-serif',
      }}>
        {eyebrow}
      </div>
      <div style={{
        fontSize: 13.5, fontWeight: 600, color: C.textPrimary,
        marginBottom: 12, letterSpacing: '-0.2px', fontFamily: 'Poppins, sans-serif',
      }}>
        {title}
      </div>
    </>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ margin = 12 }) {
  return <div style={{ height: 0.5, background: C.border, margin: `${margin}px 0` }} />
}

// ─── Section label ────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 500, color: C.textSecondary,
      marginBottom: 8, marginTop: 4, fontFamily: 'Poppins, sans-serif',
    }}>
      {children}
    </div>
  )
}

// ─── Two-column grid ──────────────────────────────────────────────────────────
export function Grid({ children, cols = 2, gap = 10, style }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Banner (notice/disclaimer) ───────────────────────────────────────────────
export function Banner({ type = 'orange', icon, children }) {
  const colours = {
    orange: { bg: '#FFF8F5', border: C.orange, text: '#7A3800' },
    blue: { bg: '#EEF4FF', border: C.blue, text: '#1A3366' },
    green: { bg: C.greenLight, border: C.green, text: '#27500A' },
    red: { bg: C.redLight, border: C.red, text: '#7A0000' },
  }
  const col = colours[type] || colours.orange
  return (
    <div style={{
      background: col.bg, border: `0.5px solid ${col.border}`,
      borderRadius: 8, padding: '9px 12px', marginBottom: 12,
      display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      {icon && <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{icon}</span>}
      <div style={{ fontSize: 11, lineHeight: 1.7, color: col.text, fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Consent checkbox row ─────────────────────────────────────────────────────
export function ConsentRow({ checked, onChange, children, disabled }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 8,
        padding: '10px 12px',
        border: `0.5px solid ${C.border}`,
        borderRadius: 8, background: C.bgField, marginBottom: 6,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange?.(e.target.checked)}
        disabled={disabled}
        style={{ marginTop: 2, width: 14, height: 14, flexShrink: 0, accentColor: C.teal }}
      />
      <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.7, fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Add row button ───────────────────────────────────────────────────────────
export function AddRowButton({ onClick, label, orange }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontFamily: 'Poppins, sans-serif', fontWeight: 500,
        color: orange ? C.orange : C.teal,
        background: 'none',
        border: `0.5px solid ${orange ? C.orange : C.teal}`,
        borderRadius: 8, padding: '5px 12px', cursor: 'pointer', marginTop: 4,
      }}
    >
      {label}
    </button>
  )
}

// ─── Remove row button ────────────────────────────────────────────────────────
export function RemoveRowButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Remove"
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: C.textMuted, fontSize: 16, padding: '0 4px',
        alignSelf: 'flex-end', paddingBottom: 6,
      }}
    >
      ✕
    </button>
  )
}

// ─── Primary / ghost buttons ──────────────────────────────────────────────────
export function Button({ onClick, children, primary, disabled, loading, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: '8px 22px',
        borderRadius: 8,
        fontSize: 13, fontFamily: 'Poppins, sans-serif', fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        border: primary ? `1px solid ${C.teal}` : `0.5px solid ${C.border}`,
        background: primary ? C.teal : C.bgCard,
        color: primary ? C.white : C.textPrimary,
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {loading ? 'Saving…' : children}
    </button>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    DRAFT: { bg: '#E6F4F4', color: C.teal, label: 'Draft' },
    SUBMITTED: { bg: '#EEF4FF', color: C.blue, label: 'Submitted' },
    IN_REVIEW: { bg: C.amberLight, color: C.amber, label: 'In review' },
    CLIENT_REVISING: { bg: '#FFF0E6', color: C.orange, label: 'Client revising' },
    LOCKED: { bg: '#fee2e2', color: '#a32d2d', label: 'Locked' },
    COMPLETED: { bg: C.greenLight, color: '#3B6D11', label: 'Completed' },
  }
  const s = map[status] || { bg: C.bgField, color: C.textSecondary, label: status }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 11, fontWeight: 500, fontFamily: 'Poppins, sans-serif',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}

// ─── Last saved indicator ─────────────────────────────────────────────────────
export function LastSaved({ savedAt, saving }) {
  if (saving) return (
    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Poppins, sans-serif' }}>
      Saving…
    </span>
  )
  if (!savedAt) return null
  const t = new Date(savedAt)
  const label = t.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  return (
    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Poppins, sans-serif' }}>
      Last saved {label}
    </span>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export function LoadingSkeleton() {
  const bar = (w, h = 14) => (
    <div style={{
      width: w, height: h, borderRadius: 6,
      background: 'linear-gradient(90deg, #e0eded 25%, #f0f7f7 50%, #e0eded 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      marginBottom: 8,
    }} />
  )
  return (
    <div style={{ padding: 24 }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {bar('60%', 22)}
      {bar('40%', 14)}
      <div style={{ height: 16 }} />
      {bar('100%', 48)}
      {bar('100%', 48)}
      {bar('100%', 48)}
    </div>
  )
}

// ─── AML status badge ─────────────────────────────────────────────────────────
export function AmlBadge({ status }) {
  const map = {
    PENDING: { bg: C.bgField, color: C.textSecondary, label: 'Pending' },
    IN_PROGRESS: { bg: C.amberLight, color: C.amber, label: 'In progress' },
    VERIFIED: { bg: C.greenLight, color: '#3B6D11', label: '✓ Verified' },
    FAILED: { bg: C.redLight, color: '#a32d2d', label: '✗ Failed' },
    EXPIRED: { bg: '#fee2e2', color: '#a32d2d', label: 'Expired' },
  }
  const s = map[status] || map.PENDING
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  )
}
