// src/presentation/components/molecules/CreationWizard/WizardNav.tsx
//
// Navegación inferior estándar de un flujo de creación por pasos:
// Anterior / Cancelar a la izquierda, Siguiente / Guardar a la derecha.

import React from 'react'

interface WizardNavProps {
  step: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
  saving?: boolean
  submitLabel?: string
  savingLabel?: string
}

export function WizardNav({
  step, totalSteps, onPrev, onNext, onSubmit,
  saving = false, submitLabel = '✓ Crear', savingLabel = '⏳ Guardando…',
}: WizardNavProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
      <button
        type="button"
        onClick={onPrev}
        style={{ padding: '0.625rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}
      >
        {step === 1 ? '← Cancelar' : '← Anterior'}
      </button>

      {step < totalSteps ? (
        <button
          type="button"
          onClick={onNext}
          style={{ padding: '0.625rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.625rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
        >
          Siguiente →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          style={{ padding: '0.625rem 1.75rem', background: saving ? '#93c5fd' : '#16a34a', color: '#fff', border: 'none', borderRadius: '0.625rem', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? savingLabel : submitLabel}
        </button>
      )}
    </div>
  )
}
