import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users, ArrowLeft, Pencil, User, Calendar, AlertCircle,
  ClipboardList, Home, DollarSign, Network, FileText, UserCheck, Zap
} from 'lucide-react'
import { socialWorkService } from '../../../services/socialWorkService'
import type { SocialWorkReportApi } from '../../../types/socialWork'
import '../../styles/lp.css'

const TYPE_LABELS: Record<string, string> = {
  initial_assessment: 'Valoración Inicial',
  follow_up:          'Seguimiento',
  family_meeting:     'Reunión Familiar',
  crisis_intervention:'Intervención en Crisis',
  discharge_planning: 'Planificación de Alta',
  resource_referral:  'Referencia de Recursos',
}

const SUPPORT_LABELS: Record<string, string> = {
  high:     'Alto',
  moderate: 'Moderado',
  low:      'Bajo',
  none:     'Ninguno',
}

const SUPPORT_COLORS: Record<string, { bg: string; color: string }> = {
  high:     { bg: '#dcfce7', color: '#15803d' },
  moderate: { bg: '#fef9c3', color: '#854d0e' },
  low:      { bg: '#fee2e2', color: '#b91c1c' },
  none:     { bg: '#f1f5f9', color: '#64748b' },
}

const LIVING_LABELS: Record<string, string> = {
  nursing_home:    'Hogar de adultos mayores',
  family_home:     'Hogar familiar',
  independent:     'Independiente',
  assisted_living: 'Vida asistida',
  other:           'Otro',
}

const getPatientName = (r: SocialWorkReportApi) => {
  const p = r.patient
  return p ? [p.name, p.firstLastName, p.secondLastName].filter(Boolean).join(' ') : '—'
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
        <span style={{ color: '#0891b2' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

export default function ViewSocialWorkReportPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [report, setReport] = useState<SocialWorkReportApi | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    socialWorkService.getReportById(Number(id))
      .then(data => { setReport(data); setLoading(false) })
      .catch(() => { setError('No se pudo cargar el reporte de trabajo social.'); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="lp-page">
      <div className="lp-loading"><div className="lp-spinner" style={{ borderTopColor: '#0891b2' }} /><span>Cargando reporte…</span></div>
    </div>
  )

  if (error || !report) return (
    <div className="lp-page">
      <div className="lp-error">
        <AlertCircle size={18} />
        {error || 'Reporte no encontrado'}
        <button className="lp-error__retry" onClick={() => navigate('/social-work')}>Volver</button>
      </div>
    </div>
  )

  const sc = SUPPORT_COLORS[report.family_support_level ?? ''] ?? { bg: '#f1f5f9', color: '#64748b' }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/social-work')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="#0891b2" /> Reporte de Trabajo Social #{report.id}
            </h1>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Creado el {fmtDT(report.created_at)}
              {report.updated_at ? ` · Actualizado ${fmtDT(report.updated_at)}` : ''}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/social-work/edit/${report.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar reporte
        </button>
      </div>

      {/* Patient banner */}
      <div style={{ background: 'linear-gradient(135deg, #164e63 0%, #0891b2 100%)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Paciente</p>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{getPatientName(report)}</p>
          {report.patient?.identification && (
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', opacity: 0.85 }}>Cédula: {report.patient.identification}</p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Fecha del reporte</p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} /> {fmtDate(report.report_date)}
          </p>
          <div style={{ marginTop: '0.375rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {TYPE_LABELS[report.report_type] ?? report.report_type}
            </span>
          </div>
        </div>
      </div>

      {/* Quick badges */}
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {report.family_support_level && (
          <span style={{ background: sc.bg, color: sc.color, borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            Apoyo familiar: {SUPPORT_LABELS[report.family_support_level] ?? report.family_support_level}
          </span>
        )}
        {report.current_living_arrangement && (
          <span style={{ background: '#f0f9ff', color: '#0369a1', borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            Vivienda: {LIVING_LABELS[report.current_living_arrangement] ?? report.current_living_arrangement}
          </span>
        )}
        {report.follow_up_date && (
          <span style={{ background: '#fef9c3', color: '#92400e', borderRadius: '999px', padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            Seguimiento: {fmtDate(report.follow_up_date)}
          </span>
        )}
      </div>

      {/* Staff */}
      {report.staff && (
        <Section title="Trabajador/a Social" icon={<UserCheck size={16} />}>
          <Field label="Nombre" value={[report.staff.name, report.staff.firstLastName].filter(Boolean).join(' ')} />
          {report.staff.email && <Field label="Correo" value={report.staff.email} />}
        </Section>
      )}

      {/* Evaluación social */}
      <Section title="Evaluación social" icon={<ClipboardList size={16} />}>
        <Field label="Evaluación social" value={fmt(report.social_assessment)} wide />
        <Field label="Dinámica familiar" value={fmt(report.family_dynamics)} wide />
      </Section>

      {/* Situación económica y vivienda */}
      <Section title="Situación económica y vivienda" icon={<DollarSign size={16} />}>
        <Field label="Situación financiera" value={fmt(report.financial_situation)} wide />
        <Field label="Vivienda actual" value={report.current_living_arrangement ? (LIVING_LABELS[report.current_living_arrangement] ?? report.current_living_arrangement) : '—'} />
      </Section>

      {/* Recursos y servicios */}
      <Section title="Recursos y servicios" icon={<Network size={16} />}>
        <Field label="Recursos comunitarios" value={fmt(report.community_resources)} wide />
        <Field label="Servicios sociales requeridos" value={fmt(report.social_services_needed)} wide />
      </Section>

      {/* Recomendaciones y plan */}
      <Section title="Recomendaciones y plan de acción" icon={<FileText size={16} />}>
        <Field label="Recomendaciones" value={fmt(report.recommendations)} wide />
        <Field label="Plan de acción" value={fmt(report.action_plan)} wide />
      </Section>

      {/* Cita vinculada */}
      {report.appointment && (
        <Section title="Cita vinculada" icon={<Zap size={16} />}>
          <Field label="ID de cita" value={String(report.appointment.id)} />
          <Field label="Fecha de la cita" value={fmtDate(report.appointment.appointmentDate)} />
        </Section>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => navigate('/social-work')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
          <ArrowLeft size={14} /> Regresar a lista
        </button>
        <button type="button" onClick={() => navigate(`/social-work/edit/${report.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar
        </button>
      </div>
    </div>
  )
}
