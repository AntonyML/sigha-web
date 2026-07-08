// src/presentation/components/molecules/CreationWizard/WizardTopBar.tsx
//
// Encabezado estándar de las vistas de creación: botón "Volver", título y
// contador "Paso X de N" (si aplica). Mismo patrón en toda la app.

import React from 'react'

interface WizardTopBarProps {
  title: string
  onBack: () => void
  backLabel?: string
  currentStep?: number
  totalSteps?: number
}

export function WizardTopBar({ title, onBack, backLabel = '← Volver', currentStep, totalSteps }: WizardTopBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <button
          onClick={onBack}
          type="button"
          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', color: '#64748b', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          {backLabel}
        </button>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{title}</h1>
      </div>
      {totalSteps != null && currentStep != null && (
        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Paso {currentStep} de {totalSteps}</span>
      )}
    </div>
  )
}
