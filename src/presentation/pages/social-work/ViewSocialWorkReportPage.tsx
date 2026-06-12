import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users, ArrowLeft, Pencil, User, Calendar, AlertCircle,
  ClipboardList, DollarSign, Network,
} from 'lucide-react'
import { socialWorkService, type SocialWorkReportApi } from '../../../services/socialWorkService'
import '../../styles/lp.css'

const VISIT_TYPE_LABELS: Record<string, string> = {
  'home visit':          'Visita domiciliar',
  'institutional visit': 'Visita institucional',
  'interview':           'Entrevista',
  'follow_up':           'Seguimiento',
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
              Creado el {fmtDT(report.create_at)}
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
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Cita vinculada</p>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>#{report.id_appointment}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Fecha del reporte</p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} /> {fmtDate(report.sw_date)}
          </p>
          <div style={{ marginTop: '0.375rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {VISIT_TYPE_LABELS[report.sw_visit_type] ?? report.sw_visit_type}
            </span>
          </div>
        </div>
      </div>

      {/* Relación familiar */}
      <Section title="Relación familiar" icon={<ClipboardList size={16} />}>
        <Field label="Relación familiar" value={fmt(report.sw_family_relationship)} wide />
      </Section>

      {/* Situación económica y apoyo */}
      <Section title="Situación económica y apoyo" icon={<DollarSign size={16} />}>
        <Field label="Evaluación económica" value={fmt(report.sw_economic_assessment)} wide />
        <Field label="Apoyo social" value={fmt(report.sw_social_support)} wide />
      </Section>

      {/* Observaciones y recomendaciones */}
      <Section title="Observaciones y recomendaciones" icon={<Network size={16} />}>
        <Field label="Observaciones" value={fmt(report.sw_observations)} wide />
        <Field label="Recomendaciones" value={fmt(report.sw_recommendations)} wide />
      </Section>

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
