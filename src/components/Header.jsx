import React from 'react'
import { C, StatusBadge, LastSaved } from './UI.jsx'

const STEPS = ['Start', 'Personal', 'Goals', 'Finance', 'Property', 'Submit']
const STEPS_ADVISOR = ['Start', 'Personal', 'Goals', 'Finance', 'Property', 'AML/KYC', 'Submit']

export default function Header({ currentStep, onStepClick, status, savedAt, saving, role, companyName, advisorName }) {
  const steps = role === 'advisor' ? STEPS_ADVISOR : STEPS
  const total = steps.length

  return (
    <div style={{ background: C.teal, padding: '16px 24px 0', borderRadius: '12px 12px 0 0' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {/* Logo mark */}
        <div style={{
          width: 36, height: 36, borderRadius: 7, background: C.orange,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.white, fontWeight: 700, fontSize: 15, flexShrink: 0,
          fontFamily: 'Poppins, sans-serif',
        }}>
          {(companyName || 'PIERS TECH Pty Ltd').charAt(0)}
        </div>
        <div>
          <div style={{
            color: 'rgba(255,255,255,0.6)', fontSize: 9,
            letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 500,
            fontFamily: 'Poppins, sans-serif',
          }}>
            {companyName || 'PIERS TECH Pty Ltd'}{advisorName ? ` · ${advisorName}` : ''}
          </div>
          <div style={{
            color: C.white, fontSize: 15, fontWeight: 600, marginTop: 2,
            letterSpacing: '-0.2px', fontFamily: 'Poppins, sans-serif',
          }}>
            Property Risk Fact Find
          </div>
        </div>
        {/* Right side: status + saved indicator */}
        <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {status && <StatusBadge status={status} />}
          <LastSaved savedAt={savedAt} saving={saving} />
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'flex-start', paddingBottom: 14 }}>
        {steps.map((label, idx) => {
          const isDone = idx < currentStep
          const isActive = idx === currentStep
          const isClickable = isDone || isActive

          return (
            <div
              key={label}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: isClickable ? 'pointer' : 'default' }}
              onClick={() => isClickable && onStepClick?.(idx)}
            >
              {/* Connector line */}
              {idx < total - 1 && (
                <div style={{
                  position: 'absolute', top: 11, left: '50%',
                  width: '100%', height: 2,
                  background: isDone ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                  zIndex: 0,
                }} />
              )}
              {/* Dot */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: `2px solid ${isActive ? C.orange : isDone ? C.white : 'rgba(255,255,255,0.3)'}`,
                background: isActive ? C.orange : isDone ? C.white : C.teal,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
                color: isDone ? C.teal : isActive ? C.white : 'rgba(255,255,255,0.5)',
                position: 'relative', zIndex: 1, transition: 'all 0.2s',
              }}>
                {isDone ? '✓' : idx + 1}
              </div>
              {/* Label */}
              <div style={{
                fontSize: 8.5, marginTop: 4, textAlign: 'center', lineHeight: 1.3,
                fontFamily: 'Poppins, sans-serif', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'rgba(255,255,255,0.95)' : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
              }}>
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
