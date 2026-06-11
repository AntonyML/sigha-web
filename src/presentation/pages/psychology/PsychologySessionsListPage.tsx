import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2, Eye } from 'lucide-react'
import { psychologyService } from '../../../services/psychologyService'
import type { PsychologySession } from '../../../types/psychology'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const TYPE_LABELS: Record<string, string> = {
  evaluation:     'Evaluación',
  therapy:        'Terapia',
  follow_up:      'Seguimiento',
  'group therapy': 'Terapia Grupal',
}

const MOOD_LABELS: Record<string, string> = {
  stable:    'Estable',
  anxious:   'Ansioso',
  depressed: 'Deprimido',
  irritable: 'Irritable',
  other:     'Otro',
}

const MOOD_COLORS: Record<string, string> = {
  stable:    'lp-badge--info',
  anxious:   'lp-badge--warning',
  depressed: 'lp-badge--purple',
  irritable: 'lp-badge--danger',
  other:     '',
}

const getPatientName = (s: PsychologySession) => {
  const p = (s.id_appointment ?? s.appointment)?.patient
  return p ? [p.name, p.firstLastName, p.secondLastName].filter(Boolean).join(' ') : ''
}

export default function PsychologySessionsListPage() {
  const [sessions, setSessions] = useState<PsychologySession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [moodFilter, setMoodFilter] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await psychologyService.getSessions()
      setSessions(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las sesiones de psicología')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar sesión', '¿Está seguro de que desea eliminar esta sesión?')
    if (!ok) return
    try {
      await psychologyService.deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      feedback.success('Sesión eliminada exitosamente.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar la sesión')
    }
  }

  const filtered = sessions.filter(s => {
    const matchMood = !moodFilter || s.psy_mood === moodFilter
    if (!searchTerm.trim()) return matchMood
    const term = searchTerm.toLowerCase()
    const patientName = getPatientName(s).toLowerCase()
    const matchText = (
      patientName.includes(term) ||
      (((s.id_appointment ?? s.appointment)?.patient?.identification) ?? '').toLowerCase().includes(term) ||
      (TYPE_LABELS[s.psy_session_type ?? ''] ?? s.psy_session_type ?? '').toLowerCase().includes(term) ||
      (s.psy_observations ?? '').toLowerCase().includes(term)
    )
    return matchMood && matchText
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Brain size={22} color="#7c3aed" />
          Sesiones de Psicología
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--purple" onClick={() => navigate('/psychology/create')}>
            <Plus size={16} /> Nueva Sesión
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="lp-error" style={{ marginBottom: '0.5rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="lp-search-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div className="lp-search-wrap" style={{ flex: 1, minWidth: 220 }}>
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por nombre de paciente, cédula o tipo…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado de ánimo</label>
          <select
            value={moodFilter}
            onChange={e => setMoodFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', minWidth: 150 }}
          >
            <option value="">Todos</option>
            {Object.entries(MOOD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {moodFilter && (
          <button
            type="button"
            onClick={() => setMoodFilter('')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', alignSelf: 'flex-end' }}
          >
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" style={{ borderTopColor: '#7c3aed' }} />
          <span>Cargando sesiones...</span>
        </div>
      ) : error ? (
        <div className="lp-empty">
          <AlertCircle size={48} className="lp-empty__icon" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button className="lp-btn lp-btn--purple" style={{ marginTop: '0.75rem' }} onClick={loadSessions}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <Brain size={48} className="lp-empty__icon" />
          <p>No se encontraron sesiones de psicología</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Paciente</th>
                  <th>Tipo de sesión</th>
                  <th>Estado de ánimo</th>
                  <th>Observaciones</th>
                  <th>Fecha</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(session => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        {getPatientName(session) || <span className="lp-muted">Sin paciente</span>}
                      </div>
                      {(session.id_appointment ?? session.appointment)?.patient?.identification && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{(session.id_appointment ?? session.appointment)!.patient!.identification}</div>
                      )}
                    </td>
                    <td>
                      <span className="lp-badge" style={{ background: '#ede9fe', color: '#5b21b6', border: '1px solid #ddd6fe' }}>
                        {TYPE_LABELS[session.psy_session_type ?? ''] ?? session.psy_session_type ?? '—'}
                      </span>
                    </td>
                    <td>
                      {session.psy_mood
                        ? <span className={`lp-badge ${MOOD_COLORS[session.psy_mood] ?? ''}`}>{MOOD_LABELS[session.psy_mood] ?? session.psy_mood}</span>
                        : <span className="lp-muted">—</span>}
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.psy_observations || <span className="lp-muted">—</span>}
                    </td>
                    <td>{formatDate(session.psy_date)}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn"
                          title="Ver detalle"
                          style={{ color: '#7c3aed' }}
                          onClick={() => navigate(`/psychology/view/${session.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/psychology/edit/${session.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}