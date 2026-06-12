import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  psychologyService,
  type UpdatePsychologySessionDto,
  type PsychologySessionType,
  type Mood,
  type CognitiveStatus,
} from '../../../services/psychologyService'

const SESSION_TYPES: { value: PsychologySessionType; label: string }[] = [
  { value: 'evaluation',    label: 'Evaluación' },
  { value: 'therapy',       label: 'Terapia' },
  { value: 'follow_up',     label: 'Seguimiento' },
  { value: 'group therapy', label: 'Terapia Grupal' },
]

const MOODS: { value: Mood; label: string }[] = [
  { value: 'stable',    label: 'Estable' },
  { value: 'anxious',   label: 'Ansioso' },
  { value: 'depressed', label: 'Deprimido' },
  { value: 'irritable', label: 'Irritable' },
  { value: 'other',     label: 'Otro' },
]

const COGNITIVE_STATES: { value: CognitiveStatus; label: string }[] = [
  { value: 'normal',              label: 'Normal' },
  { value: 'mild impairment',     label: 'Deterioro Leve' },
  { value: 'moderate impairment', label: 'Deterioro Moderado' },
  { value: 'severe impairment',   label: 'Deterioro Severo' },
]

// ─── styles ────────────────────────────────────────────────────────────────────────────
const wrap: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }
const headerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem',
}
const titleStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  fontSize: '1.4rem', fontWeight: 700, color: '#4c1d95', margin: 0,
}
const dot: React.CSSProperties = {
  width: 36, height: 36, borderRadius: '50%',
  background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem',
}
const btnBack: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#475569', fontWeight: 500,
}
const card: React.CSSProperties = {
  background: '#fff', borderRadius: '1rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 6px 20px rgba(124,58,237,0.07)',
  padding: '2rem',
}
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }
const fullRow: React.CSSProperties = { gridColumn: '1 / -1' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 700,
  color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem',
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
const loadingBox: React.CSSProperties = { textAlign: 'center', padding: '3rem 1rem', color: '#7c3aed' }
const spinner: React.CSSProperties = {
  width: 40, height: 40, borderRadius: '50%',
  border: '3px solid #ede9fe', borderTop: '3px solid #7c3aed',
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
  padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)',
  border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
  fontSize: '0.875rem', color: '#fff', fontWeight: 600,
}

export default function EditPsychologySessionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<UpdatePsychologySessionDto>({})

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setFetching(true)
      try {
        const s = await psychologyService.getSessionById(Number(id))
        setForm({
          psy_session_type:     s.psy_session_type,
          psy_mood:             s.psy_mood,
          psy_cognitive_status: s.psy_cognitive_status,
          psy_observations:     s.psy_observations ?? undefined,
          psy_therapy_goal:     s.psy_therapy_goal ?? undefined,
          psy_progress:         s.psy_progress ?? undefined,
          psy_date:             s.psy_date?.slice(0, 10),
        })
      } catch (err) {
        console.error(err)
        setError('Error al cargar la sesión de psicología')
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
      await psychologyService.updateSession(Number(id), form)
      navigate('/psychology')
    } catch (err) {
      console.error(err)
      setError('Error al actualizar la sesión de psicología')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={loadingBox}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={spinner} />
        <p style={{ color: '#94a3b8', margin: 0 }}>Cargando sesión...</p>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          <span style={dot}>🧠</span>
          Editar Sesión de Psicología
        </h2>
        <button style={btnBack} onClick={() => navigate('/psychology')}>
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
              <label style={labelStyle}>Tipo de sesión</label>
              <select style={inputStyle} name="psy_session_type" value={form.psy_session_type ?? ''} onChange={handleChange}>
                <option value="">Seleccionar tipo</option>
                {SESSION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Fecha de sesión</label>
              <input style={inputStyle} type="date" name="psy_date" value={form.psy_date ?? ''} onChange={handleChange} />
            </div>

            <div>
              <label style={labelStyle}>Estado de ánimo</label>
              <select style={inputStyle} name="psy_mood" value={form.psy_mood ?? ''} onChange={handleChange}>
                <option value="">Seleccionar estado</option>
                {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Estado cognitivo</label>
              <select style={inputStyle} name="psy_cognitive_status" value={form.psy_cognitive_status ?? ''} onChange={handleChange}>
                <option value="">Seleccionar estado</option>
                {COGNITIVE_STATES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Observaciones de la sesión</label>
              <textarea style={textareaStyle} name="psy_observations" value={form.psy_observations ?? ''} onChange={handleChange} placeholder="Observaciones detalladas de la sesión..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Objetivo terapéutico</label>
              <textarea style={textareaStyle} name="psy_therapy_goal" value={form.psy_therapy_goal ?? ''} onChange={handleChange} placeholder="Meta u objetivo de esta sesión terapéutica..." />
            </div>

            <div style={fullRow}>
              <label style={labelStyle}>Progreso y evolución</label>
              <textarea style={textareaStyle} name="psy_progress" value={form.psy_progress ?? ''} onChange={handleChange} placeholder="Descripción del progreso observado..." />
            </div>
          </div>

          <div style={btnRow}>
            <button type="button" style={btnCancel} onClick={() => navigate('/psychology')} disabled={loading}>
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
