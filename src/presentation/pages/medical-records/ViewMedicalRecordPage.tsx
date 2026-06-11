import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FileText, ArrowLeft, Pencil, User, Stethoscope, Activity,
  ClipboardList, RefreshCw, AlertCircle, Calendar, UserCheck
} from 'lucide-react'
import { medicalRecordService } from '../../../services/medicalRecordService'
import type { MedicalRecord } from '../../../types/medicalRecord'
import '../../styles/lp.css'

const RECORD_TYPE_LABELS: Record<string, string> = {
  routine_check:       'Control Rutinario',
  emergency:           'Emergencia',
  follow_up:           'Seguimiento',
  specialist_referral: 'Referencia a Especialista',
  lab_results:         'Resultados de Laboratorio',
  imaging:             'Imagenología',
  surgery:             'Cirugía',
  discharge:           'Alta',
}

const VITAL_LABELS: Record<string, string> = {
  normal:   'Normal',
  abnormal: 'Anormal',
  critical: 'Crítico',
}

const getFullName = (p?: MedicalRecord['patient']) =>
  p ? [p.name, p.firstLastName, p.secondLastName].filter(Boolean).join(' ') : '—'

const getStaffName = (s?: MedicalRecord['staff']) =>
  s ? [s.name, s.firstLastName, s.secondLastName].filter(Boolean).join(' ') : '—'

const fmt  = (v?: string) => v || '—'
const fmtN = (v?: number) => v !== undefined && v !== null ? String(v) : '—'
const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const fmtDateTime = (v?: string) => v ? new Date(v).toLocaleString('es-CR') : '—'

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
        <span style={{ color: '#2563eb' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {children}
      </div>
    </div>
  )
}

export default function ViewMedicalRecordPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    medicalRecordService.getMedicalRecordById(Number(id))
      .then(data => { setRecord(data); setLoading(false) })
      .catch(() => { setError('No se pudo cargar el registro médico.'); setLoading(false) })
  }, [id])

  const vitalColor = (s?: string) => {
    if (s === 'normal')   return { bg: '#dcfce7', color: '#15803d' }
    if (s === 'critical') return { bg: '#fee2e2', color: '#dc2626' }
    if (s === 'abnormal') return { bg: '#fef9c3', color: '#854d0e' }
    return { bg: '#f1f5f9', color: '#475569' }
  }

  if (loading) return (
    <div className="lp-page">
      <div className="lp-loading">
        <div className="lp-spinner" />
        <span>Cargando registro médico…</span>
      </div>
    </div>
  )

  if (error || !record) return (
    <div className="lp-page">
      <div className="lp-error">
        <AlertCircle size={18} />
        {error || 'Registro no encontrado'}
        <button className="lp-error__retry" onClick={() => navigate('/medical-records')}>Volver</button>
      </div>
    </div>
  )

  const vc = vitalColor(record.vital_signs_status)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button type="button" onClick={() => navigate('/medical-records')}
            style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#2563eb" /> Registro Médico #{record.id}
            </h1>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Creado el {fmtDateTime(record.created_at)}
              {record.updated_at ? ` · Actualizado ${fmtDateTime(record.updated_at)}` : ''}
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/medical-records/edit/${record.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> Editar registro
        </button>
      </div>

      {/* Patient banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Paciente</p>
          <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{getFullName(record.patient)}</p>
          {record.patient?.identification && (
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.8125rem', opacity: 0.85 }}>
              Cédula: {record.patient.identification}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75 }}>Fecha del registro</p>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} /> {fmtDate(record.record_date)}
          </p>
          <div style={{ marginTop: '0.375rem' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', padding: '0.2rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}>
              {RECORD_TYPE_LABELS[record.record_type] ?? record.record_type}
            </span>
          </div>
        </div>
      </div>

      {/* Vital signs status badge */}
      {record.vital_signs_status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Activity size={14} color={vc.color} />
          <span style={{ background: vc.bg, color: vc.color, borderRadius: '999px', padding: '0.25rem 0.875rem', fontSize: '0.8125rem', fontWeight: 700 }}>
            Signos vitales: {VITAL_LABELS[record.vital_signs_status] ?? record.vital_signs_status}
          </span>
        </div>
      )}

      {/* Staff */}
      {record.staff && (
        <Section title="Médico / Responsable" icon={<UserCheck size={16} />}>
          <Field label="Nombre" value={getStaffName(record.staff)} />
          {record.staff.email && <Field label="Correo electrónico" value={record.staff.email} />}
        </Section>
      )}

      {/* Motivo / Historial */}
      <Section title="Motivo y antecedentes" icon={<ClipboardList size={16} />}>
        <Field label="Motivo de consulta" value={fmt(record.chief_complaint)} wide />
        <Field label="Historial médico relevante" value={fmt(record.medical_history)} wide />
        <Field label="Medicamentos actuales" value={fmt(record.current_medications)} wide />
        <Field label="Alergias" value={fmt(record.allergies)} wide />
      </Section>

      {/* Signos vitales */}
      <Section title="Signos vitales" icon={<Activity size={16} />}>
        <Field label="Temperatura (°C)" value={fmtN(record.temperature)} />
        <Field label="Presión sistólica (mmHg)" value={fmtN(record.blood_pressure_systolic)} />
        <Field label="Presión diastólica (mmHg)" value={fmtN(record.blood_pressure_diastolic)} />
        <Field label="Frecuencia cardíaca (bpm)" value={fmtN(record.heart_rate)} />
        <Field label="Frecuencia respiratoria" value={fmtN(record.respiratory_rate)} />
        <Field label="Saturación de O₂ (%)" value={fmtN(record.oxygen_saturation)} />
        <Field label="Peso (kg)" value={fmtN(record.weight)} />
        <Field label="Talla (cm)" value={fmtN(record.height)} />
        <Field label="IMC" value={fmtN(record.bmi)} />
      </Section>

      {/* Evaluación y plan */}
      <Section title="Evaluación y plan de tratamiento" icon={<Stethoscope size={16} />}>
        <Field label="Examen físico" value={fmt(record.physical_examination)} wide />
        <Field label="Diagnóstico" value={fmt(record.diagnosis)} wide />
        <Field label="Plan de tratamiento" value={fmt(record.treatment_plan)} wide />
        <Field label="Medicamentos prescritos" value={fmt(record.prescribed_medications)} wide />
        <Field label="Indicaciones de seguimiento" value={fmt(record.follow_up_instructions)} wide />
        <Field label="Notas adicionales" value={fmt(record.notes)} wide />
      </Section>

      {/* Footer actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => navigate('/medical-records')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#64748b' }}>
          <ArrowLeft size={14} /> Regresar a lista
        </button>
        <button type="button" onClick={() => navigate(`/medical-records/edit/${record.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
          <Pencil size={14} /> <RefreshCw size={12} /> Editar
        </button>
      </div>
    </div>
  )
}
