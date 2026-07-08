// src/presentation/components/molecules/CreationWizard/WizardCard.tsx
//
// Tarjeta blanca redondeada con título — contenedor estándar para cada
// paso de un flujo de creación. (Nombrada "WizardCard" para no chocar
// con el átomo shadcn `Card`.)

import React from 'react'

interface WizardCardProps {
  title: string
  children: React.ReactNode
}

export function WizardCard({ title, children }: WizardCardProps) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{title}</h2>
      {children}
    </div>
  )
}

export function WizardSectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ margin: '0 0 0.625rem', fontWeight: 600, fontSize: '0.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', ...style }}>
      {children}
    </p>
  )
}

export function WizardGrid({ cols, children, style }: { cols: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '1rem', marginBottom: '1rem', ...style }}>
      {children}
    </div>
  )
}

export function WizardField({ label, required, children, style }: { label: string; required?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>
        {label} {required && <span style={{ color: '#dc2626', textTransform: 'none' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function WizardPillBtn({ active, onClick, children, variant = 'blue', size = 'sm' }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
  variant?: 'blue' | 'red' | 'neutral'; size?: 'sm' | 'md'
}) {
  const colors = {
    blue:    { on: { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' } },
    red:     { on: { bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' } },
    neutral: { on: { bg: '#f1f5f9', border: '#94a3b8', color: '#475569' }, off: { bg: '#f8fafc', border: '#e2e8f0', color: '#94a3b8' } },
  }
  const c = active ? colors[variant].on : colors[variant].off
  const pad = size === 'md' ? '0.45rem 1rem' : '0.3rem 0.75rem'
  return (
    <button type="button" onClick={onClick} style={{
      padding: pad, borderRadius: '999px', border: `1px solid ${c.border}`,
      background: c.bg, color: c.color, cursor: 'pointer', fontSize: '0.8125rem',
      fontWeight: active ? 700 : 400, transition: 'all 150ms',
    }}>{children}</button>
  )
}
