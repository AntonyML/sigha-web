import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { socialWorkService } from '../../../services/socialWorkService'
import type { UpdateSocialWorkReportDto } from '../../../types/socialWork'

const REPORT_TYPES = [
  { value: 'initial_assessment',  label: 'Valoración Inicial' },
  { value: 'follow_up',           label: 'Seguimiento' },
  { value: 'family_meeting',      label: 'Reunión Familiar' },
  { value: 'crisis_intervention', label: 'Intervención en Crisis' },
  { value: 'discharge_planning',  label: 'Planificación de Alta' },
  { value: 'resource_referral',   label: 'Referencia de Recursos' },
]

const SUPPORT_LEVELS = [
  { value: 'high',     label: 'Alto' },
  { value: 'moderate', label: 'Moderado' },
  { value: 'low',      label: 'Bajo' },
  { value: 'none',     label: 'Ninguno' },
]

const LIVING_ARRANGEMENTS = [
  { value: 'nursing_home',    label: 'Hogar de ancianos' },
  { value: 'family_home',     label: 'Hogar familiar' },
  { value: 'independent',     label: 'Independiente' },
  { value: 'assisted_living', label: 'Vivienda asistida' },
  { value: 'other',           label: 'Otro' },
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
          report_type:              r.report_type,
          report_date:              r.report_date?.slice(0, 10),
          social_assessment:        r.social_assessment,
          family_dynamics:          r.family_dynamics,
          family_support_level:     r.family_support_level,
          current_living_arrangement: r.current_living_arrangement,
          financial_situation:      r.financial_situation,
          community_resources:      r.community_resources,
          social_services_needed:   r.social_services_needed,
          recommendations:          r.recommendations,
          action_plan:              r.action_plan,
          follow_up_date:           r.follow_up_date?.slice(0, 10),
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
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
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
              <label style={labelStyle}>Tipo de reporte</label>
              <select style={inputStyle} name="report_type" value={form.report_type ?? ''} onChange={handleChange}>
                <option value="">Seleccionar tipo</option>
                {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fecha del reporte</label>
              <input style={inputStyle} type="date" name="report_date" value={form.report_date ?? ''} onChange={handleChange} />
            </div>

            <div>
              <label style={labelStyle}>Apoyo familiar</label>
              <select style={inputStyle} name="family_support_level" value={form.family_support_level ?? ''} onChange={handleChange}>
                <option value="">Seleccionar nivel</option>
                {SUPPORT_LEVELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Condición de vivienda</label>
              <select style={inputStyle} name="current_living_arrangement" value={form.current_living_arrangement ?? ''} onChange={handleChange}>
                <option value="">Seleccionar condición</option>
                {LIVING_ARRANGEMENTS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fecha de seguimiento</label>
              <input style={inputStyle} type="date" name="follow_up_date" value={form.follow_up_date ?? ''} onChange={handleChange} />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Evaluación social</label>
              <textarea style={textareaStyle} name="social_assessment" value={form.social_assessment ?? ''} onChange={handleChange} placeholder="Evaluación de la situación social del paciente..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Dinámica familiar</label>
              <textarea style={textareaStyle} name="family_dynamics" value={form.family_dynamics ?? ''} onChange={handleChange} placeholder="Descripción de la dinámica y relaciones familiares..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Situación económica</label>
              <textarea style={textareaStyle} name="financial_situation" value={form.financial_situation ?? ''} onChange={handleChange} placeholder="Descripción de la situación financiera..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Recursos comunitarios</label>
              <textarea style={textareaStyle} name="community_resources" value={form.community_resources ?? ''} onChange={handleChange} placeholder="Recursos disponibles en la comunidad..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Servicios sociales necesarios</label>
              <textarea style={textareaStyle} name="social_services_needed" value={form.social_services_needed ?? ''} onChange={handleChange} placeholder="Servicios sociales que se requieren..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Recomendaciones</label>
              <textarea style={textareaStyle} name="recommendations" value={form.recommendations ?? ''} onChange={handleChange} placeholder="Recomendaciones del trabajador social..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Plan de acción</label>
              <textarea style={textareaStyle} name="action_plan" value={form.action_plan ?? ''} onChange={handleChange} placeholder="Plan de acción detallado..." />
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