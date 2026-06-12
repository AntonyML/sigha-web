import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, AlertTriangle, Loader2,
  ShieldCheck, HeartPulse, Syringe, Activity,
  CalendarCheck, ClipboardList, User,
} from 'lucide-react'
import { virtualFileService } from '../../../services/virtualFileService'
import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService'
import { nursingService } from '../../../services/nursingService'
import { medicalRecordService } from '../../../services/medicalRecordService'
import type { VirtualFile } from '../../../types/virtualFile'
import type { SpecializedAppointmentApi } from '../../../types/specializedAppointment'
import type { NursingAppointment } from '../../../types/nursing'
import { AppointmentStatusApi, AppointmentPriorityApi, AppointmentTypeApi } from '../../../types/specializedAppointment'
import { appointmentStatusColors, appointmentPriorityColors, appointmentTypeLabels, appointmentStatusLabels, appointmentPriorityLabels } from '../../../types/nursing'

/* ─── helpers ─────────────────────────────────────────── */
function fmt(val?: string | null): string { return val?.trim() || '' }
function fmtDate(s?: string): string {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleDateString('es-CR')
}
function fmtDateTime(s?: string): string {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? s : d.toLocaleString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function badge(v?: boolean) {
  return (
    <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: v ? '#dcfce7' : '#f1f5f9', color: v ? '#15803d' : '#64748b' }}>
      {v ? 'Sí' : 'No'}
    </span>
  )
}
function countConditions(f: VirtualFile): number {
  return [f.hta, f.dbt, f.dislip, f.irc, f.cardioIsq, f.acv, f.amputacion, f.tabaquismo, f.alcoholismo, f.parkinson, f.demencia, f.prostatismo, f.incontinenciaUrinaria, f.caidasFrecuentes, f.neoplasias].filter(Boolean).length
}
function countVaccines(f: VirtualFile): number {
  return [f.vacunaCt, f.vacunaHepB, f.vacunaGripe, f.vacunaNeumococo].filter(Boolean).length
}

/* ─── sub-components ──────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', marginBottom: '1.25rem', overflow: 'hidden' }}>
      <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#1e293b' }}>{title}</h5>
      </div>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </div>
  )
}
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '0.9rem', color: '#1e293b' }}>{value}</div>
    </div>
  )
}

/* ─── Badge maps for appointments ─────────────────────── */
const statusBadge: Record<string, { bg: string; color: string; label: string }> = {
  [AppointmentStatusApi.SCHEDULED]:   { bg: '#dbeafe', color: '#1d4ed8', label: 'Programada' },
  [AppointmentStatusApi.IN_PROGRESS]: { bg: '#fef9c3', color: '#854d0e', label: 'En progreso' },
  [AppointmentStatusApi.COMPLETED]:   { bg: '#dcfce7', color: '#15803d', label: 'Completada' },
  [AppointmentStatusApi.CANCELLED]:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
  [AppointmentStatusApi.RESCHEDULED]: { bg: '#e0f2fe', color: '#0369a1', label: 'Reprogramada' },
}
const priorityBadge: Record<string, { bg: string; color: string; label: string }> = {
  [AppointmentPriorityApi.LOW]:    { bg: '#f1f5f9', color: '#475569', label: 'Baja' },
  [AppointmentPriorityApi.MEDIUM]: { bg: '#dbeafe', color: '#1d4ed8', label: 'Media' },
  [AppointmentPriorityApi.HIGH]:   { bg: '#fef9c3', color: '#854d0e', label: 'Alta' },
  [AppointmentPriorityApi.URGENT]: { bg: '#fee2e2', color: '#991b1b', label: 'Urgente' },
}
const typeLabel: Record<string, string> = {
  [AppointmentTypeApi.CHECKUP]:    'Chequeo',
  [AppointmentTypeApi.EVALUATION]: 'Evaluación',
  [AppointmentTypeApi.THERAPY]:    'Terapia',
  [AppointmentTypeApi.FOLLOW_UP]:  'Seguimiento',
  [AppointmentTypeApi.EMERGENCY]:  'Emergencia',
}

/* ─── Unified row type for the appointments tab ───────── */
type UnifiedAppointment =
  | { source: 'specialized'; data: SpecializedAppointmentApi }
  | { source: 'nursing';     data: NursingAppointment }

/* ─── Tab: Citas del residente (ambos sistemas) ───────── */
function TabAppointments({ patientId, navigate }: { patientId: number; navigate: (r: string) => void }) {
  const [items, setItems] = useState<UnifiedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      specializedAppointmentsService.getByPatient(patientId),
      nursingService.getAppointmentsByPatientId(patientId),
    ]).then(([specResult, nursingResult]) => {
      const unified: UnifiedAppointment[] = []
      if (specResult.status === 'fulfilled') {
        specResult.value.forEach(d => unified.push({ source: 'specialized', data: d }))
      }
      if (nursingResult.status === 'fulfilled') {
        nursingResult.value.forEach(d => unified.push({ source: 'nursing', data: d }))
      }
      // Ordenar por fecha descendente
      unified.sort((a, b) => {
        const dateA = a.source === 'specialized'
          ? (a.data as SpecializedAppointmentApi).saAppointmentDate
          : (a.data as NursingAppointment).appointmentDate
        const dateB = b.source === 'specialized'
          ? (b.data as SpecializedAppointmentApi).saAppointmentDate
          : (b.data as NursingAppointment).appointmentDate
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      if (unified.length === 0 && specResult.status === 'rejected' && nursingResult.status === 'rejected') {
        setError('No se pudieron cargar las citas')
      }
      setItems(unified)
    }).finally(() => setLoading(false))
  }, [patientId])

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}><Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando citas…</div>
  if (error) return <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', color: '#991b1b' }}>{error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{items.length} cita(s) registrada(s) (enfermería + especializadas)</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/nursing/appointments/new')}
            style={{ padding: '0.375rem 0.875rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
          >
            + Cita Enfermería
          </button>
          <button
            onClick={() => navigate('/specialized-appointments/create')}
            style={{ padding: '0.375rem 0.875rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
          >
            + Cita Especializada
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #e2e8f0' }}>
          <CalendarCheck size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No hay citas registradas para este residente</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Origen', 'Fecha', 'Tipo', 'Prioridad', 'Estado', 'Duración', 'Notas'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                if (item.source === 'specialized') {
                  const a = item.data as SpecializedAppointmentApi
                  const s = statusBadge[a.saStatus ?? ''] ?? { bg: '#f1f5f9', color: '#475569', label: a.saStatus ?? '' }
                  const p = priorityBadge[a.saPriority ?? ''] ?? { bg: '#f1f5f9', color: '#475569', label: a.saPriority ?? '' }
                  return (
                    <tr key={`spec-${a.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>Especializada</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{fmtDateTime(a.saAppointmentDate)}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{typeLabel[a.saAppointmentType ?? ''] ?? a.saAppointmentType ?? '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: p.bg, color: p.color }}>{p.label}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{a.saDurationMinutes ? `${a.saDurationMinutes} min` : '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', maxWidth: '180px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.saNotes ?? '—'}</span>
                      </td>
                    </tr>
                  )
                } else {
                  const a = item.data as NursingAppointment
                  const statusColor = appointmentStatusColors[a.status] ?? 'secondary'
                  const priorityColor = appointmentPriorityColors[a.priority] ?? 'secondary'
                  const bsToInline: Record<string, { bg: string; color: string }> = {
                    primary: { bg: '#dbeafe', color: '#1d4ed8' },
                    success: { bg: '#dcfce7', color: '#15803d' },
                    warning: { bg: '#fef9c3', color: '#854d0e' },
                    danger:  { bg: '#fee2e2', color: '#991b1b' },
                    info:    { bg: '#e0f2fe', color: '#0369a1' },
                    secondary:{ bg: '#f1f5f9', color: '#475569' },
                  }
                  const sc = bsToInline[statusColor] ?? bsToInline.secondary
                  const pc = bsToInline[priorityColor] ?? bsToInline.secondary
                  return (
                    <tr key={`nurs-${a.id}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>Enfermería</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{fmtDateTime(a.appointmentDate)}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{appointmentTypeLabels[a.appointmentType] ?? a.appointmentType}</td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: pc.bg, color: pc.color }}>{appointmentPriorityLabels[a.priority]}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>
                        <span style={{ padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{appointmentStatusLabels[a.status]}</span>
                      </td>
                      <td style={{ padding: '0.625rem 0.75rem' }}>{a.durationMinutes ? `${a.durationMinutes} min` : '—'}</td>
                      <td style={{ padding: '0.625rem 0.75rem', maxWidth: '180px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes ?? '—'}</span>
                      </td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Tab: Registros Médicos del residente ────────────── */
function TabMedicalRecords({ patientId, navigate }: { patientId: number; navigate: (r: string) => void }) {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    medicalRecordService.getMedicalRecords(patientId)
      .then(setRecords)
      .catch(() => setError('No se pudieron cargar los registros médicos'))
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}><Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} /> Cargando registros…</div>
  if (error) return <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', color: '#991b1b' }}>{error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{records.length} registro(s) médico(s)</p>
        <button
          onClick={() => navigate(`/medical-records/create`)}
          style={{ padding: '0.375rem 0.875rem', background: '#f97316', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
        >
          + Nuevo Registro
        </button>
      </div>
      {records.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #e2e8f0' }}>
          <ClipboardList size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>No hay registros médicos para este residente</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['ID', 'Fecha', 'Diagnóstico', 'Médico', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.625rem 0.75rem' }}><span style={{ background: '#f1f5f9', padding: '0.125rem 0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>#{r.id}</span></td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>{fmtDate(r.createdAt ?? r.date ?? r.recordDate)}</td>
                  <td style={{ padding: '0.625rem 0.75rem', maxWidth: '220px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.diagnosis ?? r.description ?? '—'}</span>
                  </td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>{r.doctor ?? r.staff ?? r.physician ?? '—'}</td>
                  <td style={{ padding: '0.625rem 0.75rem' }}>
                    <button
                      onClick={() => navigate(`/medical-records/view/${r.id}`)}
                      style={{ padding: '0.25rem 0.625rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────── */
type TabId = 'personal' | 'appointments' | 'medical-records'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',        label: 'Datos Personales', icon: <User size={15} /> },
  { id: 'appointments',    label: 'Citas',             icon: <CalendarCheck size={15} /> },
  { id: 'medical-records', label: 'Registros Médicos', icon: <ClipboardList size={15} /> },
]

export default function ViewAdultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<VirtualFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('personal')

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    setError(null)
    virtualFileService.getVirtualFileById(Number(id))
      .then(vf => setData(vf))
      .catch(err => {
        console.error('Error fetching virtual file:', err)
        setError('No se pudo cargar el expediente. Verifique la conexión e intente de nuevo.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (!id) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1.5rem' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', padding: '1.25rem', color: '#991b1b' }}>
          ID de expediente no proporcionado.
        </div>
        <button onClick={() => navigate('/virtualFiles')} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Volver a la lista
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '0.75rem', color: '#64748b' }}>
        <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
        <span>Cargando expediente</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '0.75rem', padding: '1.25rem', color: '#991b1b' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Error al cargar el expediente</strong>
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={() => navigate('/virtualFiles')} style={{ padding: '0.5rem 1.25rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer' }}>Volver</button>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.25rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>Reintentar</button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const condCount = countConditions(data)
  const vacCount = countVaccines(data)
  const patientId = Number(id)

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/virtualFiles')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8125rem' }}>
            <ArrowLeft size={15} /> Regresar
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Expediente #{id}</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>{fmt(data.nombreApellido)}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/virtualFiles/edit/${id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.125rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <Pencil size={15} /> Editar
        </button>
      </div>

      {/* Clinical summary badges */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { icon: <HeartPulse size={16} color="#dc2626" />, label: 'Condiciones activas', count: condCount, bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
          { icon: <Syringe size={16} color="#0891b2" />, label: 'Vacunas aplicadas', count: vacCount, bg: '#ecfeff', border: '#a5f3fc', color: '#0e7490' },
          { icon: <Activity size={16} color="#7c3aed" />, label: 'Registro clínico', count: 1, bg: '#f5f3ff', border: '#c4b5fd', color: '#5b21b6' },
          { icon: <ShieldCheck size={16} color="#059669" />, label: 'Estado', count: null as null, label2: 'Activo', bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 1rem', background: item.bg, border: `1px solid ${item.border}`, borderRadius: '0.625rem', fontSize: '0.8125rem', color: item.color }}>
            {item.icon}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>{item.count !== null ? item.count : item.label2}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.625rem 1.25rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? '#3b82f6' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.15s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === 'personal' && (
        <>
          {/* Datos personales */}
          <Section title=" Datos Personales">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0 1.5rem' }}>
              <Field label="Fecha de registro" value={fmtDate(data.fecha)} />
              <Field label="Cédula" value={fmt(data.cedula)} />
              <Field label="Nombre completo" value={fmt(data.nombreApellido)} />
              <Field label="Edad" value={fmt(data.edad)} />
              <Field label="Fecha de nacimiento" value={fmtDate(data.fechaNacimiento)} />
              <Field label="Estado civil" value={fmt(data.estadoCivil)} />
              <Field label="Vivienda" value={fmt(data.vivienda)} />
              <Field label="Años de escolaridad" value={fmt(data.anosEscolaridad)} />
              <Field label="Trabajo previo" value={fmt(data.trabajoPrevio)} />
              {data.zonaProcedencia && <Field label="Zona de procedencia" value={data.zonaProcedencia} />}
              {data.genero && <Field label="Género" value={data.genero} />}
              {data.tipoSangre && <Field label="Tipo de sangre" value={data.tipoSangre} />}
            </div>
          </Section>

          {/* Contacto */}
          <Section title=" Información de Contacto">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0 1.5rem' }}>
              <Field label="Teléfono" value={fmt(data.telefono)} />
              <Field label="Email" value={fmt(data.email)} />
              {data.ingresoEconomico !== undefined && <Field label="Ingreso económico" value={` ${data.ingresoEconomico?.toLocaleString('es-CR') ?? ''}`} />}
              {data.cantidadHijos !== undefined && <Field label="Hijos" value={String(data.cantidadHijos)} />}
            </div>
          </Section>

          {/* Antecedentes clínicos */}
          <Section title=" Antecedentes Clínicos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0 1.5rem', marginBottom: '1rem' }}>
              <Field label="Tensión arterial" value={fmt(data.ta)} />
              <Field label="Peso" value={data.peso ? `${data.peso} kg` : ''} />
              <Field label="Talla" value={data.talla ? `${data.talla} cm` : ''} />
              <Field label="IMC" value={fmt(data.imc)} />
              <Field label="RCVG" value={fmt(data.rcvg)} />
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condiciones médicas</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.375rem' }}>
                {[
                  ['HTA', data.hta], ['Diabetes', data.dbt], ['Dislipidemia', data.dislip],
                  ['IRC', data.irc], ['Cardiopatía isquémica', data.cardioIsq], ['ACV', data.acv],
                  ['Amputación', data.amputacion], ['Tabaquismo', data.tabaquismo], ['Alcoholismo', data.alcoholismo],
                  ['Parkinson', data.parkinson], ['Demencia', data.demencia], ['Prostatismo', data.prostatismo],
                  ['Incontinencia urinaria', data.incontinenciaUrinaria], ['Caídas frecuentes', data.caidasFrecuentes],
                  ['Neoplasias', data.neoplasias],
                ].map(([label, val]) => (
                  <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: '#f8fafc', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: '#475569' }}>{label as string}</span>
                    {badge(val as boolean)}
                  </div>
                ))}
              </div>
              {data.neoplasias && data.neoplasiasDetalle && (
                <div style={{ marginTop: '0.75rem' }}><Field label="Detalle neoplasias" value={data.neoplasiasDetalle} /></div>
              )}
              {data.otrasCondiciones && (
                <div style={{ marginTop: '0.5rem' }}><Field label="Otras condiciones" value={data.otrasCondiciones} /></div>
              )}
            </div>
          </Section>

          {/* Vacunas */}
          <Section title=" Esquema de Vacunación">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.375rem' }}>
              {[
                ['COVID-19', data.vacunaCt], ['Hepatitis B', data.vacunaHepB],
                ['Gripe', data.vacunaGripe], ['Neumococo', data.vacunaNeumococo],
              ].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#475569' }}>{label as string}</span>
                  {badge(val as boolean)}
                </div>
              ))}
            </div>
          </Section>

          {/* Evaluación funcional */}
          <Section title=" Evaluación Funcional">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0 1.5rem' }}>
              <Field label="Dificultades de visión" value={fmt(data.dificultadesVision)} />
              <Field label="Problemas de audición" value={fmt(data.problemasAudicion)} />
            </div>
          </Section>
        </>
      )}

      {activeTab === 'appointments' && (
        <TabAppointments patientId={patientId} navigate={navigate} />
      )}

      {activeTab === 'medical-records' && (
        <TabMedicalRecords patientId={patientId} navigate={navigate} />
      )}
    </div>
  )
}
