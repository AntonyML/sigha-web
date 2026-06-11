import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Brain, ArrowLeft, Pencil, User, Calendar, AlertCircle,
  ClipboardList, Target, TrendingUp, Zap, UserCheck
} from 'lucide-react'
import { psychologyService } from '../../../services/psychologyService'
import type { PsychologySession } from '../../../types/psychology'
import '../../styles/lp.css'

const TYPE_LABELS: Record<string, string> = {
  evaluation:      'Evaluación',
  therapy:         'Terapia',
  follow_up:       'Seguimiento',
  'group therapy': 'Terapia Grupal',
}

const MOOD_LABELS: Record<string, string> = {
  stable:    'Estable',
  anxious:   'Ansioso',
  depressed: 'Deprimido',
  irritable: 'Irritable',
  other:     'Otro',
}

const MOOD_COLORS: Record<string, { bg: string; color: string }> = {
  stable:    { bg: '#dbeafe', color: '#1d4ed8' },
  anxious:   { bg: '#fef9c3', color: '#92400e' },
  depressed: { bg: '#ede9fe', color: '#6d28d9' },
  irritable: { bg: '#fee2e2', color: '#dc2626' },
  other:     { bg: '#f1f5f9', color: '#475569' },
}

const COGNITIVE_LABELS: Record<string, string> = {
  normal:               'Normal',
  'mild impairment':     'Deterioro Leve',
  'moderate impairment': 'Deterioro Moderado',
  'severe impairment':   'Deterioro Severo',
}

const COGNITIVE_COLORS: Record<string, { bg: string; color: string }> = {
  normal:               { bg: '#dcfce7', color: '#15803d' },
  'mild impairment':     { bg: '#fef9c3', color: '#854d0e' },
  'moderate impairment': { bg: '#fee2e2', color: '#b91c1c' },
  'severe impairment':   { bg: '#fce7f3', color: '#9d174d' },
}

const getPatientName = (s: PsychologySession) => {
  const p = s.appointment?.patient
  return p ? [p.name, p.firstLastName, p.secondLastName].filter(Boolean).join(' ') : '—'
}
const getStaffName = (s: PsychologySession) => {
  const st = s.appointment?.staff
  return st ? [st.name, st.firstLastName].filter(Boolean).join(' ') : '—'
}
const fmt     = (v?: string | null) => v || '—'
const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const fmtDT   = (v?: string) => v ? new Date(v).toLocaleString('es-CR') : '—'

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
        <span style={{ color: '#7c3aed' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

export default function ViewPsychologySessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<PsychologySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    psychologyService.getSessionById(Number(id))
      .then(data => { setSession(data); setLoading(false) })
      .catch(() => { setError('No se pudo cargar la sesión de psicología.'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="lp-page">
      <div className="lp-loading"><div className="lp-spinner" style={{ borderTopColor: '#7c3aed' }} /><span>Cargando sesión…</span></div>
    </div>
  )

  if (error || !session) return (
    <div className="lp-page">
      <div className="lp-error">
        <AlertCircle size={18} />
        {error || 'Sesión no encontrada'}
        <button className="lp-error__retry" onClick={() => navigate('/psychology')}>Volver</button>
      </div>
    </div>
  )

  const mc = MOOD_COLORS[session.psy_mood] ?? { bg: '#f1f5f9', color: '#475569' }
  const cc = COGNITIVE_COLORS[session.psy_cognitive_status] ?? { bg: '#f1f5f9', color: '#475569' }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/psychology')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="#7c3aed" /> Sesión de Psicología
            </h1>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Creada el {fmtDT(session.created_at)}
              {session.updated_at ? ` · Actualizada ${fmtDT(session.updated_at)}` : ''}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/psychology/edit/${session.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar sesión
        </button>
      </div>

      {/* Patient banner */}
      <div style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Paciente</p>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{getPatientName(session)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Fecha de sesión</p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} /> {fmtDate(session.psy_date)}
          </p>
          <div style={{ marginTop: '0.375rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {TYPE_LABELS[session.psy_session_type] ?? session.psy_session_type}
            </span>
          </div>
        </div>
      </div>

      {/* Quick badges */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span style={{ background: mc.bg, color: mc.color, borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          Estado de ánimo: {MOOD_LABELS[session.psy_mood] ?? session.psy_mood}
        </span>
        <span style={{ background: cc.bg, color: cc.color, borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
          Estado cognitivo: {COGNITIVE_LABELS[session.psy_cognitive_status] ?? session.psy_cognitive_status}
        </span>
      </div>

      {/* Staff */}
      {session.appointment?.staff && (
        <Section title="Psicólogo/a" icon={<UserCheck size={16} />}>
          <Field label="Nombre" value={getStaffName(session)} />
        </Section>
      )}

      {/* Observaciones */}
      <Section title="Observaciones de la sesión" icon={<ClipboardList size={16} />}>
        <Field label="Observaciones clínicas" value={fmt(session.psy_observations)} wide />
      </Section>

      {/* Objetivos */}
      <Section title="Objetivo terapéutico" icon={<Target size={16} />}>
        <Field label="Meta de la terapia" value={fmt(session.psy_therapy_goal)} wide />
      </Section>

      {/* Progreso */}
      <Section title="Progreso y evolución" icon={<TrendingUp size={16} />}>
        <Field label="Notas de progreso" value={fmt(session.psy_progress)} wide />
      </Section>

      {/* Cita vinculada */}
      {session.appointment && (
        <Section title="Cita vinculada" icon={<Zap size={16} />}>
          <Field label="Fecha de la cita" value={fmtDate(session.appointment.appointmentDate)} />
        </Section>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => navigate('/psychology')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
          <ArrowLeft size={14} /> Regresar a lista
        </button>
        <button type="button" onClick={() => navigate(`/psychology/edit/${session.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar
        </button>
      </div>
    </div>
  )
}
