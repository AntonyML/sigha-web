// src/presentation/components/molecules/CreationWizard/WizardStepper.tsx
//
// Indicador de pasos (círculos + conectores) reutilizable en cualquier flujo
// de creación de varios pasos. Mismo look & feel en toda la app.

import React from 'react'

export interface WizardStepDef {
  id: number
  label: string
  icon: string
}

interface WizardStepperProps {
  steps: WizardStepDef[]
  currentStep: number
  onStepClick?: (id: number) => void
}

export function WizardStepper({ steps, currentStep, onStepClick }: WizardStepperProps) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: '2rem', position: 'relative' }}>
      {steps.map((s, i) => {
        const done = currentStep > s.id
        const active = currentStep === s.id
        const lineColor = done ? '#3b82f6' : '#e2e8f0'
        return (
          <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {i < steps.length - 1 && (
              <div style={{ position: 'absolute', top: 18, left: '50%', width: '100%', height: 2, background: lineColor, zIndex: 0 }} />
            )}
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#3b82f6' : active ? '#fff' : '#f1f5f9',
                border: active ? '2px solid #3b82f6' : done ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                color: done ? '#fff' : active ? '#3b82f6' : '#94a3b8',
                fontWeight: 700, fontSize: '0.875rem', zIndex: 1, cursor: done ? 'pointer' : 'default',
                transition: 'all 200ms',
              }}
              onClick={() => done && onStepClick?.(s.id)}
            >
              {done ? '✓' : s.id}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: active ? 700 : 400, color: active ? '#1e293b' : '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>
              {s.icon} {s.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
