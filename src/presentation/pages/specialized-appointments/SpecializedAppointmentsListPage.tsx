import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, ArrowLeft, Plus, Search, X, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { specializedAppointmentsService } from '../../../services/specializedAppointmentsService'
import type { SpecializedAppointmentApi } from '../../../types/specializedAppointment'
import { AppointmentStatusApi, AppointmentPriorityApi, AppointmentTypeApi } from '../../../types/specializedAppointment'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const statusBadge: Record<string, string> = {
  [AppointmentStatusApi.SCHEDULED]: 'lp-badge--info',
  [AppointmentStatusApi.IN_PROGRESS]: 'lp-badge--warning',
  [AppointmentStatusApi.COMPLETED]: 'lp-badge--success',
  [AppointmentStatusApi.CANCELLED]: 'lp-badge--danger',
  [AppointmentStatusApi.RESCHEDULED]: 'lp-badge--secondary',
}
const statusLabel: Record<string, string> = {
  [AppointmentStatusApi.SCHEDULED]: 'Programada',
  [AppointmentStatusApi.IN_PROGRESS]: 'En progreso',
  [AppointmentStatusApi.COMPLETED]: 'Completada',
  [AppointmentStatusApi.CANCELLED]: 'Cancelada',
  [AppointmentStatusApi.RESCHEDULED]: 'Reprogramada',
}
const priorityBadge: Record<string, string> = {
  [AppointmentPriorityApi.URGENT]: 'lp-badge--danger',
  [AppointmentPriorityApi.HIGH]: 'lp-badge--warning',
  [AppointmentPriorityApi.MEDIUM]: 'lp-badge--primary',
  [AppointmentPriorityApi.LOW]: 'lp-badge--secondary',
}
const priorityLabel: Record<string, string> = {
  [AppointmentPriorityApi.URGENT]: 'Urgente',
  [AppointmentPriorityApi.HIGH]: 'Alta',
  [AppointmentPriorityApi.MEDIUM]: 'Media',
  [AppointmentPriorityApi.LOW]: 'Baja',
}
const typeLabel: Record<string, string> = {
  [AppointmentTypeApi.CHECKUP]: 'Chequeo',
  [AppointmentTypeApi.EVALUATION]: 'Evaluación',
  [AppointmentTypeApi.THERAPY]: 'Terapia',
  [AppointmentTypeApi.FOLLOW_UP]: 'Seguimiento',
  [AppointmentTypeApi.EMERGENCY]: 'Emergencia',
}

export default function SpecializedAppointmentsListPage() {
  const [items, setItems] = useState<SpecializedAppointmentApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await specializedAppointmentsService.getAll())
    } catch {
      setError('Error al cargar citas especializadas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: number) => {
    const ok = await feedback.confirm('Eliminar cita', '¿Confirmar eliminación de la cita?')
    if (!ok) return
    try {
      await specializedAppointmentsService.remove(id)
      load()
    } catch (err: any) {
      feedback.error(err?.response?.data?.message ?? 'Error al eliminar la cita')
    }
  }

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

  const filtered = items.filter(i => {
    if (!search.trim()) return true
    const t = search.toLowerCase()
    return (
      (i.saAppointmentType ?? '').toLowerCase().includes(t) ||
      (i.saStatus ?? '').toLowerCase().includes(t) ||
      (i.saNotes ?? '').toLowerCase().includes(t)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <CalendarCheck size={22} color="#0891b2" />
          Citas Especializadas
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--success" onClick={() => navigate('/specialized-appointments/create')}>
            <Plus size={16} /> Nueva Cita
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={load}>Reintentar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por tipo, estado o notas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="lp-search-clear" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="lp-loading">
          <div className="lp-spinner" />
          <span>Cargando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <CalendarCheck size={48} className="lp-empty__icon" />
          <p>{search ? 'No se encontraron resultados.' : 'No hay citas registradas.'}</p>
          {!search && (
            <button className="lp-btn lp-btn--success" onClick={() => navigate('/specialized-appointments/create')}>
              <Plus size={15} /> Crear primera cita
            </button>
          )}
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-table-wrap">
            <table className="lp-table">
              <thead className="lp-table-head">
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Paciente</th>
                  <th>Área</th>
                  <th>Duración</th>
                  <th className="center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(item => (
                  <tr key={item.id}>
                    <td><span className="lp-badge lp-badge--id">{item.id}</span></td>
                    <td><small>{formatDate(item.saAppointmentDate)}</small></td>
                    <td>
                      {item.saAppointmentType
                        ? <span className="lp-badge lp-badge--secondary">{typeLabel[item.saAppointmentType] ?? item.saAppointmentType}</span>
                        : <span className="lp-muted"></span>}
                    </td>
                    <td>
                      {item.saPriority
                        ? <span className={`lp-badge ${priorityBadge[item.saPriority] ?? 'lp-badge--secondary'}`}>{priorityLabel[item.saPriority] ?? item.saPriority}</span>
                        : <span className="lp-muted"></span>}
                    </td>
                    <td>
                      {item.saStatus
                        ? <span className={`lp-badge ${statusBadge[item.saStatus] ?? 'lp-badge--secondary'}`}>{statusLabel[item.saStatus] ?? item.saStatus}</span>
                        : <span className="lp-muted"></span>}
                    </td>
                    <td>{item.idPatient ?? <span className="lp-muted"></span>}</td>
                    <td>{item.idArea ?? <span className="lp-muted"></span>}</td>
                    <td>{item.saDurationMinutes ? `${item.saDurationMinutes} min` : <span className="lp-muted"></span>}</td>
                    <td className="center">
                      <div className="lp-table-actions">
                        <button
                          className="lp-icon-btn lp-icon-btn--edit"
                          title="Editar"
                          onClick={() => navigate(`/specialized-appointments/edit/${item.id}`)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="lp-icon-btn lp-icon-btn--delete"
                          title="Eliminar"
                          onClick={() => handleDelete(item.id!)}
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