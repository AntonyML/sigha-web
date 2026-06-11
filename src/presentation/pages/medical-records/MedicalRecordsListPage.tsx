import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2, Eye } from 'lucide-react'
import { medicalRecordService } from '../../../services/medicalRecordService'
import type { MedicalRecord } from '../../../types/medicalRecord'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const getPatientName = (r: MedicalRecord) => {
  const p = r.id_older_adult
  if (!p) return ''
  return [p.oa_name, p.oa_f_last_name, p.oa_s_last_name].filter(Boolean).join(' ')
}

export default function MedicalRecordsListPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await medicalRecordService.getMedicalRecords()
      setRecords(data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los registros médicos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadRecords() }, [loadRecords])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar registro', '¿Está seguro de que desea eliminar este registro médico?')
    if (!ok) return
    try {
      await medicalRecordService.deleteMedicalRecord(id)
      setRecords(prev => prev.filter(r => r.id !== id))
      feedback.success('Registro médico eliminado exitosamente.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar el registro médico')
    }
  }

  const filtered = records.filter(r => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const patientName = getPatientName(r).toLowerCase()
    const identification = (r.id_older_adult?.oa_identification ?? '').toLowerCase()
    return (
      patientName.includes(term) ||
      identification.includes(term) ||
      (r.mr_origin_area ?? '').toLowerCase().includes(term) ||
      (r.mr_diagnosis ?? '').toLowerCase().includes(term) ||
      (r.mr_summary ?? '').toLowerCase().includes(term)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <FileText size={22} color="#2563eb" />
          Registros Médicos
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--primary" onClick={() => navigate('/medical-records/create')}>
            <Plus size={16} /> Nuevo Registro
          </button>
        </div>
      </div>

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por nombre de paciente, cédula, área o diagnóstico"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lp-search-clear" onClick={() => setSearchTerm('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando registros...</span>
        </div>
      ) : error ? (
        <div className="lp-empty">
          <AlertCircle size={48} className="lp-empty__icon" style={{ color: '#ef4444' }} />
          <p style={{ color: '#ef4444', fontWeight: 600 }}>{error}</p>
          <button className="lp-btn lp-btn--primary" style={{ marginTop: '0.75rem' }} onClick={loadRecords}>
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <FileText size={48} className="lp-empty__icon" />
          <p>No se encontraron registros médicos</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>Paciente</th>
                  <th>Área de origen</th>
                  <th>Resumen</th>
                  <th>Diagnóstico</th>
                  <th>Fecha</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(record => (
                  <tr key={record.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                        {getPatientName(record) || <span className="lp-muted">Sin paciente</span>}
                      </div>
                      {record.id_older_adult?.oa_identification && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                          {record.id_older_adult.oa_identification}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="lp-badge lp-badge--info">
                        {record.mr_origin_area}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.mr_summary || <span className="lp-muted"></span>}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.mr_diagnosis || <span className="lp-muted"></span>}
                    </td>
                    <td>{formatDate(record.mr_record_date)}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn"
                          title="Ver detalle"
                          style={{ color: '#2563eb' }}
                          onClick={() => navigate(`/medical-records/view/${record.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/medical-records/edit/${record.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(record.id)}
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
