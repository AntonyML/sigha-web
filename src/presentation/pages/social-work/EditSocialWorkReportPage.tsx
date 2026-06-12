import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  socialWorkService,
  type UpdateSocialWorkReportDto,
  type SocialWorkVisitType,
} from '../../../services/socialWorkService'

const VISIT_TYPES: { value: SocialWorkVisitType; label: string }[] = [
  { value: 'home visit',          label: 'Visita domiciliar' },
  { value: 'institutional visit', label: 'Visita institucional' },
  { value: 'interview',           label: 'Entrevista' },
  { value: 'follow_up',           label: 'Seguimiento' },
]

// ─── styles ────────────────────────────────────────────────────────────────────────────
const wrap: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }
const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem',
}
const titleStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  fontSize: '1.4rem', fontWeight: 700, color: '#164e63', margin: 0,
}
const dot: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'linear-gradient(135deg,#0891b2,#06b6d4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem',
}
const btnBack: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569', fontWeight: 500,
}
const card: React.CSSProperties = {
  background: '#fff', borderRadius: '1rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 6px 20px rgba(8,145,178,0.07)',
  padding: '2rem',
}
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }
const fullRow: React.CSSProperties = { gridColumn: '1 / -1' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 700,
  color: '#0891b2', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #e2e8f0',
  borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box',
  fontFamily: 'inherit', background: '#fafbfc',
}
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: 'vertical', minHeight: 90 }
const errorBox: React.CSSProperties = {
  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem',
  padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem',
}
const loadingBox: React.CSSProperties = { textAlign: 'center', padding: '3rem 1rem', color: '#0891b2' }
const spinner: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  border: '3px solid #cffafe', borderTop: '3px solid #0891b2',
  animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
}
const btnRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem',
}
const btnCancel: React.CSSProperties = {
  padding: '0.6rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569', fontWeight: 500,
}
const btnSave: React.CSSProperties = {
  padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg,#0891b2,#164e63)',
  border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
  fontSize: '0.875rem', color: '#fff', fontWeight: 600,
}

export default function EditSocialWorkReportPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<UpdateSocialWorkReportDto>({})

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setFetching(true)
      try {
        const r = await socialWorkService.getReportById(Number(id))
        setForm({
          sw_visit_type:           r.sw_visit_type,
          sw_date:                 r.sw_date?.slice(0, 10),
          sw_family_relationship:  r.sw_family_relationship ?? undefined,
          sw_economic_assessment:  r.sw_economic_assessment ?? undefined,
          sw_social_support:       r.sw_social_support ?? undefined,
          sw_observations:         r.sw_observations ?? undefined,
          sw_recommendations:      r.sw_recommendations ?? undefined,
        })
      } catch (err) {
        console.error(err)
        setError('Error al cargar el reporte de trabajo social')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setLoading(true)
    setError('')
    try {
      await socialWorkService.updateReport(Number(id), form)
      navigate('/social-work')
    } catch (err) {
      console.error(err)
      setError('Error al actualizar el reporte de trabajo social')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={loadingBox}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={spinner} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Cargando reporte...</p>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <span style={dot}>🤝</span>
          Editar Reporte de Trabajo Social
        </h2>
        <button style={btnBack} onClick={() => navigate('/social-work')}>
          ← Regresar
        </button>
      </div>

      {error && (
        <div style={errorBox}>
          <span>{error}</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div style={card}>
        <form onSubmit={handleSubmit}>
          <div style={grid}>
            <div>
              <label style={labelStyle}>Tipo de visita</label>
              <select style={inputStyle} name="sw_visit_type" value={form.sw_visit_type ?? ''} onChange={handleChange}>
                <option value="">Seleccionar tipo</option>
                {VISIT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fecha del reporte</label>
              <input style={inputStyle} type="date" name="sw_date" value={form.sw_date ?? ''} onChange={handleChange} />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Relación familiar</label>
              <input style={inputStyle} type="text" name="sw_family_relationship" value={form.sw_family_relationship ?? ''} onChange={handleChange} placeholder="Descripción de la relación familiar" />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Evaluación económica</label>
              <textarea style={textareaStyle} name="sw_economic_assessment" value={form.sw_economic_assessment ?? ''} onChange={handleChange} placeholder="Descripción de la situación financiera..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Apoyo social</label>
              <textarea style={textareaStyle} name="sw_social_support" value={form.sw_social_support ?? ''} onChange={handleChange} placeholder="Servicios sociales de apoyo..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Observaciones</label>
              <textarea style={textareaStyle} name="sw_observations" value={form.sw_observations ?? ''} onChange={handleChange} placeholder="Observaciones del trabajador social..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Recomendaciones</label>
              <textarea style={textareaStyle} name="sw_recommendations" value={form.sw_recommendations ?? ''} onChange={handleChange} placeholder="Recomendaciones del trabajador social..." />
            </div>
          </div>

          <div style={btnRow}>
            <button type="button" style={btnCancel} onClick={() => navigate('/social-work')} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" style={{ ...btnSave, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Guardando...' : '✓ Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
