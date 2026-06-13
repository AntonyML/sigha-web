import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2, Eye } from 'lucide-react'
import { physiotherapyService, type PhysiotherapySessionApi } from '../../../services/physiotherapyService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
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

export default function PhysiotherapySessionsListPage() {
  const [sessions, setSessions] = useState<PhysiotherapySessionApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await physiotherapyService.getSessions()
      setSessions(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las sesiones de fisioterapia')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar sesión', '¿Está seguro de que desea eliminar esta sesión?')
    if (!ok) return
    try {
      await physiotherapyService.deleteSession(id)
      setSessions(prev => prev.filter(s => s.id !== id))
      feedback.success('Sesión eliminada exitosamente.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar la sesión')
    }
  }

  const filtered = sessions.filter(s => {
    const matchType = !typeFilter || s.ps_type === typeFilter
    if (!searchTerm.trim()) return matchType
    const term = searchTerm.toLowerCase()
    const matchText = (
      (TYPE_LABELS[s.ps_type] ?? s.ps_type ?? '').toLowerCase().includes(term) ||
      (s.ps_treatment_description ?? '').toLowerCase().includes(term) ||
      (s.ps_progress_notes ?? '').toLowerCase().includes(term)
    )
    return matchType && matchText
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Activity size={22} color="#16a34a" />
          Sesiones de Fisioterapia
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--success" onClick={() => navigate('/physiotherapy/create')}>
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
            placeholder="Buscar por tipo o descripción…"
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
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de sesión</label>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', minWidth: 180 }}
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {(typeFilter) && (
          <button
            type="button"
            onClick={() => setTypeFilter('')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', alignSelf: 'flex-end' }}
          >
            <X size={13} /> Limpiar filtro
          </button>
        )}
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando sesiones...</span>
        </div>
      ) : error ? (
        <div className="lp-empty">
          <AlertCircle size={48} className="lp-empty__icon" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button className="lp-btn lp-btn--success" style={{ marginTop: '0.75rem' }} onClick={loadSessions}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <Activity size={48} className="lp-empty__icon" />
          <p>No se encontraron sesiones de fisioterapia</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Paciente</th>
                  <th>Tipo de sesión</th>
                  <th>Nivel de movilidad</th>
                  <th>Dolor</th>
                  <th>Fecha</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(session => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        <span className="lp-muted">Sin paciente</span>
                      </div>
                    </td>
                    <td>
                      <span className="lp-badge lp-badge--success">
                        {TYPE_LABELS[session.ps_type] ?? session.ps_type}
                      </span>
                    </td>
                    <td>{(MOBILITY_LABELS[session.ps_mobility_level] ?? session.ps_mobility_level) || <span className="lp-muted">—</span>}</td>
                    <td>
                      {session.ps_pain_level !== undefined && session.ps_pain_level !== null
                        ? <span style={{ fontWeight: 600 }}>{session.ps_pain_level}<span style={{ color: '#94a3b8', fontWeight: 400 }}>/10</span></span>
                        : <span className="lp-muted">—</span>}
                    </td>
                    <td>{formatDate(session.ps_date)}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn"
                          title="Ver detalle"
                          style={{ color: '#16a34a' }}
                          onClick={() => navigate(`/physiotherapy/view/${session.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/physiotherapy/edit/${session.id}`)}
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
