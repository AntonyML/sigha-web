import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Activity, ArrowLeft, Pencil, User, Calendar, AlertCircle,
  ClipboardList, Dumbbell, FileText,
} from 'lucide-react'
import { physiotherapyService, type PhysiotherapySessionApi } from '../../../services/physiotherapyService'
import '../../styles/lp.css'

const TYPE_LABELS: Record<string, string> = {
  therapy:     'Terapia',
  evaluation:  'Evaluación',
  follow_up:   'Seguimiento',
}

const MOBILITY_LABELS: Record<string, string> = {
  high:     'Alta',
  moderate: 'Moderada',
  low:      'Baja',
  none:     'Ninguna',
}

const MOBILITY_COLORS: Record<string, { bg: string; color: string }> = {
  high:     { bg: '#dcfce7', color: '#15803d' },
  moderate: { bg: '#fef9c3', color: '#854d0e' },
  low:      { bg: '#fee2e2', color: '#b91c1c' },
  none:     { bg: '#fce7f3', color: '#9d174d' },
}

const fmt     = (v?: string | null) => v || '—'
const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const fmtDT   = (v?: string) => v ? new Date(v).toLocaleString('es-CR') : '—'

const painColor = (n?: number | null) => {
  if (n === undefined || n === null) return { bg: '#f1f5f9', color: '#64748b' }
  if (n <= 3) return { bg: '#dcfce7', color: '#15803d' }
  if (n <= 6) return { bg: '#fef9c3', color: '#854d0e' }
  return { bg: '#fee2e2', color: '#dc2626' }
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div style={{ gridColumn: wide ? '1 / -1' : undefined }}>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.875rem', color: value === '—' ? '#cbd5e1' : '#1e293b', whiteSpace: 'pre-wrap' }}>{value}</p>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ color: '#16a34a' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

export default function ViewPhysiotherapySessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<PhysiotherapySessionApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    physiotherapyService.getSessionById(Number(id))
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => { setError('No se pudo cargar la sesión de fisioterapia.'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="lp-page">
      <div className="lp-loading"><div className="lp-spinner" /><span>Cargando sesión…</span></div>
    </div>
  )

  if (error || !session) return (
    <div className="lp-page">
      <div className="lp-error">
        <AlertCircle size={18} />
        {error || 'Sesión no encontrada'}
        <button className="lp-error__retry" onClick={() => navigate('/physiotherapy')}>Volver</button>
      </div>
    </div>
  )

  const mc = MOBILITY_COLORS[session.ps_mobility_level] ?? { bg: '#f1f5f9', color: '#475569' }
  const pc = painColor(session.ps_pain_level)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/physiotherapy')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="#16a34a" /> Sesión de Fisioterapia #{session.id}
            </h1>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Creada el {fmtDT(session.create_at)}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/physiotherapy/edit/${session.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar sesión
        </button>
      </div>

      {/* Patient banner */}
      <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Cita vinculada</p>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>#{session.id_appointment}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Fecha de sesión</p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} /> {fmtDate(session.ps_date)}
          </p>
          <div style={{ marginTop: '0.375rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {TYPE_LABELS[session.ps_type] ?? session.ps_type}
            </span>
          </div>
        </div>
      </div>

      {/* Quick badges */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span style={{ background: mc.bg, color: mc.color, borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          Movilidad: {MOBILITY_LABELS[session.ps_mobility_level] ?? session.ps_mobility_level}
        </span>
        {session.ps_pain_level !== undefined && session.ps_pain_level !== null && (
          <span style={{ background: pc.bg, color: pc.color, borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            Dolor: {session.ps_pain_level}/10
          </span>
        )}
      </div>

      {/* Tratamiento */}
      <Section title="Descripción del tratamiento" icon={<ClipboardList size={16} />}>
        <Field label="Descripción del tratamiento" value={fmt(session.ps_treatment_description)} wide />
      </Section>

      {/* Plan de ejercicios */}
      <Section title="Plan de ejercicios" icon={<Dumbbell size={16} />}>
        <Field label="Ejercicios indicados" value={fmt(session.ps_exercise_plan)} wide />
      </Section>

      {/* Progreso */}
      <Section title="Notas de progreso" icon={<FileText size={16} />}>
        <Field label="Observaciones y evolución" value={fmt(session.ps_progress_notes)} wide />
      </Section>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => navigate('/physiotherapy')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
          <ArrowLeft size={14} /> Regresar a lista
        </button>
        <button type="button" onClick={() => navigate(`/physiotherapy/edit/${session.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar
        </button>
      </div>
    </div>
  )
}
