import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2, Eye } from 'lucide-react'
import { socialWorkService, type SocialWorkReportApi, type SocialWorkVisitType } from '../../../services/socialWorkService'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const VISIT_TYPE_LABELS: Record<SocialWorkVisitType, string> = {
  'home visit':         'Visita domiciliar',
  'institutional visit':'Visita institucional',
  'interview':          'Entrevista',
  'follow_up':          'Seguimiento',
}

const VISIT_TYPE_COLORS: Record<SocialWorkVisitType, string> = {
  'home visit':         'lp-badge--success',
  'institutional visit':'lp-badge--warning',
  'interview':          'lp-badge--info',
  'follow_up':          '',
}

const getPatientName = (_r: SocialWorkReportApi) => {
  return ''
}

export default function SocialWorkReportsListPage() {
  const [reports, setReports] = useState<SocialWorkReportApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [visitTypeFilter, setVisitTypeFilter] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await socialWorkService.getReports()
      setReports(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los reportes de trabajo social')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadReports() }, [loadReports])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar reporte', '¿Está seguro de que desea eliminar este reporte?')
    if (!ok) return
    try {
      await socialWorkService.deleteReport(id)
      setReports(prev => prev.filter(r => r.id !== id))
      feedback.success('Reporte eliminado exitosamente.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar el reporte')
    }
  }

  const filtered = reports.filter(r => {
    const matchType = !visitTypeFilter || r.sw_visit_type === visitTypeFilter
    if (!searchTerm.trim()) return matchType
    const term = searchTerm.toLowerCase()
    const matchText = (
      (VISIT_TYPE_LABELS[r.sw_visit_type as SocialWorkVisitType] ?? r.sw_visit_type ?? '').toLowerCase().includes(term) ||
      (r.sw_observations ?? '').toLowerCase().includes(term)
    )
    return matchType && matchText
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Users size={22} color="#0891b2" />
          Reportes de Trabajo Social
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--info" onClick={() => navigate('/social-work/create')}>
            <Plus size={16} /> Nuevo Reporte
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
            placeholder="Buscar por tipo de visita u observaciones"
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
          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de visita</label>
          <select
            value={visitTypeFilter}
            onChange={e => setVisitTypeFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', background: '#f8fafc', minWidth: 160 }}
          >
            <option value="">Todos</option>
            {(Object.entries(VISIT_TYPE_LABELS) as [SocialWorkVisitType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {visitTypeFilter && (
          <button
            type="button"
            onClick={() => setVisitTypeFilter('')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', color: '#64748b', alignSelf: 'flex-end' }}
          >
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" style={{ borderTopColor: '#0891b2' }} />
          <span>Cargando reportes...</span>
        </div>
      ) : error ? (
        <div className="lp-empty">
          <AlertCircle size={48} className="lp-empty__icon" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button className="lp-btn lp-btn--info" style={{ marginTop: '0.75rem' }} onClick={loadReports}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <Users size={48} className="lp-empty__icon" />
          <p>No se encontraron reportes de trabajo social</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Paciente</th>
                  <th>Tipo de visita</th>
                  <th>Observaciones</th>
                  <th>Recomendaciones</th>
                  <th>Fecha</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(report => (
                  <tr key={report.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        {getPatientName(report) || <span className="lp-muted">Sin paciente</span>}
                      </div>
                    </td>
                    <td>
                      {report.sw_visit_type
                        ? <span className={`lp-badge ${VISIT_TYPE_COLORS[report.sw_visit_type] ?? ''}`}>
                            {VISIT_TYPE_LABELS[report.sw_visit_type] ?? report.sw_visit_type}
                          </span>
                        : <span className="lp-muted"></span>}
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.sw_observations || <span className="lp-muted"></span>}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.sw_recommendations || <span className="lp-muted"></span>}
                    </td>
                    <td>{formatDate(report.sw_date)}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn"
                          title="Ver detalle"
                          style={{ color: '#0891b2' }}
                          onClick={() => navigate(`/social-work/view/${report.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/social-work/edit/${report.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(report.id)}
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
