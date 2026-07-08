// src/presentation/components/molecules/CreationWizard/IdentificationField.tsx
//
// Campo de cédula estándar: valida, normaliza, consulta el servicio de
// identificación (ver personLookupService) y separa el nombre completo
// devuelto en nombre(s)/apellidos usando la lógica única de nameUtils.
//
// Usar este componente en TODA vista de creación que necesite autocompletar
// nombre a partir de cédula (usuarios, adultos mayores, familiares, etc.)
// para garantizar el mismo comportamiento y la misma UI en todos lados.

import React from 'react'
import { useCedulaLookup, type CedulaStatus } from '../../../hooks/useCedulaLookup'
import { splitFullName } from '../../../../utils/nameUtils'

export interface IdentificationResolvedParts {
  fullName: string
  givenNames: string
  firstLastName: string
  secondLastName: string
  normalizedCedula: string
}

interface IdentificationFieldProps {
  value: string
  onChange: (v: string) => void
  onResolved: (parts: IdentificationResolvedParts) => void
  label?: string
  required?: boolean
  skipFirstRun?: boolean
  placeholder?: string
}

export function IdentificationField({
  value, onChange, onResolved, label = 'Cédula', required, skipFirstRun, placeholder = '1-2345-6789',
}: IdentificationFieldProps) {
  const {
    status, helperText, normalizedRaw, showForeignDialog, confirmForeign, denyForeign,
  } = useCedulaLookup(
    value,
    (nombre, normalized) => {
      const { givenNames, firstLastName, secondLastName } = splitFullName(nombre)
      onResolved({ fullName: nombre, givenNames, firstLastName, secondLastName, normalizedCedula: normalized })
    },
    { skipFirstRun }
  )

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>
        {label} {required && <span style={{ color: '#dc2626', textTransform: 'none' }}>*</span>}
      </label>
      <CedulaStatusInput
        value={value}
        status={status}
        helperText={helperText}
        normalized={normalizedRaw}
        placeholder={placeholder}
        onChange={onChange}
      />
      {showForeignDialog && (
        <ForeignIdConfirmDialog onConfirm={confirmForeign} onDeny={denyForeign} />
      )}
    </div>
  )
}

/* ── Input con estado visual (cargando / encontrado / no encontrado) ── */
function CedulaStatusInput({
  value, status, helperText, normalized, placeholder, onChange,
}: {
  value: string
  status: CedulaStatus
  helperText: string
  normalized: string
  placeholder: string
  onChange: (v: string) => void
}) {
  const borderColor =
    status === 'found'    ? '#86efac' :
    status === 'notfound' ? '#fca5a5' :
    status === 'error'    ? '#f87171' : undefined

  const helperColor =
    status === 'found' ? '#15803d' :
    status === 'error' ? '#b91c1c' : '#b45309'

  const showNormalized =
    normalized.length === 9 &&
    normalized !== value.replace(/[^0-9]/g, '') &&
    status !== 'idle'

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <input
          className="form-control"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingRight: '2.25rem', borderColor }}
        />
        <span style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', pointerEvents: 'none' }}>
          {status === 'loading'  && <span style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block' }}>⏳</span>}
          {status === 'found'    && '✅'}
          {status === 'notfound' && '❓'}
          {status === 'error'    && '⛔'}
        </span>
      </div>
      {showNormalized && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: '#6366f1' }}>
          Número normalizado: <strong>{normalized}</strong> (ceros completados)
        </p>
      )}
      {helperText && (
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', color: helperColor }}>{helperText}</p>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

/* ── Diálogo de confirmación para cédulas extranjeras (DIMEX) ── */
function ForeignIdConfirmDialog({ onConfirm, onDeny }: { onConfirm: () => void; onDeny: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: '1rem', padding: '2rem',
        maxWidth: 420, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.75rem' }}>🌍</div>
        <h3 style={{ margin: '0 0 0.5rem', textAlign: 'center', fontSize: '1.0625rem', color: '#1e293b' }}>
          ¿Cédula extranjera (DIMEX)?
        </h3>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
          El número tiene <strong>11 o más dígitos</strong>, lo que corresponde a un DIMEX (extranjero
          residente en Costa Rica). ¿Confirma que esta persona es extranjera?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" onClick={onDeny} style={{
            flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem',
            border: '1.5px solid #e2e8f0', background: '#f8fafc',
            color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          }}>
            No, corregir cédula
          </button>
          <button type="button" onClick={onConfirm} style={{
            flex: 1, padding: '0.625rem 1rem', borderRadius: '0.5rem',
            border: 'none', background: '#3b82f6',
            color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
          }}>
            Sí, es extranjero
          </button>
        </div>
      </div>
    </div>
  )
}
