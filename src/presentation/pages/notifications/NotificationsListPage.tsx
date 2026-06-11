import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ArrowLeft, Plus, Search, X, AlertCircle, Eye, Trash2 } from 'lucide-react'
import { notificationService } from '../../../services/notificationService'
import type { Notification } from '../../../types/notification'
import { useFeedbackWithNotifications } from '../../hooks/useFeedbackWithNotifications'
import { usePagination } from '../../hooks/usePagination'
import Pagination from '../../components/molecules/Pagination/Pagination'
import '../../styles/lp.css'

const typeBadge: Record<string, string> = {
  info: 'lp-badge--info',
  warning: 'lp-badge--warning',
  error: 'lp-badge--danger',
  success: 'lp-badge--success',
  alert: 'lp-badge--danger',
}

export default function NotificationsListPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const feedback = useFeedbackWithNotifications()

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await notificationService.getNotifications()
      setNotifications(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadNotifications() }, [loadNotifications])

  const handleDelete = async (id: string) => {
    const ok = await feedback.confirm('Eliminar notificación', '¿Está seguro de que desea eliminar esta notificación?')
    if (!ok) return
    try {
      await notificationService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      feedback.success('Notificación eliminada.')
    } catch (err) {
      console.error(err)
      feedback.error('Error al eliminar la notificación')
    }
  }

  const filtered = notifications.filter(n => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      n.title?.toLowerCase().includes(term) ||
      n.message?.toLowerCase().includes(term) ||
      n.type?.toLowerCase().includes(term)
    )
  })

  const { paginatedItems, page, totalPages, total, pageSize, goToPage } = usePagination(filtered)

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="lp-page">
      <div className="lp-header">
        <h2 className="lp-title">
          <Bell size={22} color="#d97706" />
          Notificaciones del Sistema
        </h2>
        <div className="lp-actions">
          <button className="lp-btn lp-btn--back" onClick={() => navigate('/main-menu')}>
            <ArrowLeft size={16} /> Regresar
          </button>
          <button className="lp-btn lp-btn--warning" onClick={() => navigate('/notifications/create')}>
            <Plus size={16} /> Nueva Notificación
          </button>
        </div>
      </div>

      {error && (
        <div className="lp-error">
          <AlertCircle size={18} />
          {error}
          <button className="lp-error__retry" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      <div className="lp-search-card">
        <div className="lp-search-wrap">
          <Search size={16} className="lp-search-icon" />
          <input
            type="text"
            className="lp-search-input"
            placeholder="Buscar por título, mensaje o tipo..."
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
          <div className="lp-spinner" style={{ borderTopColor: '#d97706' }} />
          <span>Cargando notificaciones...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="lp-empty">
          <Bell size={48} className="lp-empty__icon" />
          <p>No se encontraron notificaciones</p>
        </div>
      ) : (
        <div className="lp-card">
          <div className="lp-notif-list" style={{ padding: '1rem' }}>
            {paginatedItems.map(notif => (
              <div
                key={notif.id}
                className={`lp-notif-card ${notif.read ? 'lp-notif-card--read' : 'lp-notif-card--unread'}`}
              >
                <div className="lp-notif-card__body">
                  <div style={{ flex: 1 }}>
                    <div className="lp-notif-card__meta">
                      <span className={`lp-badge ${typeBadge[notif.type] ?? 'lp-badge--secondary'}`}>{notif.type}</span>
                      {!notif.read && <span className="lp-badge lp-badge--warning">No leída</span>}
                      <small style={{ color: '#94a3b8' }}>{notif.created_at ? formatDate(notif.created_at) : ''}</small>
                    </div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem' }}>{notif.title}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{notif.message}</span>
                  </div>
                  <div className="lp-table-actions" style={{ flexShrink: 0 }}>
                    <button
                      className="lp-icon-btn lp-icon-btn--view"
                      title="Ver"
                      onClick={() => navigate(`/notifications/view/${notif.id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="lp-icon-btn lp-icon-btn--delete"
                      title="Eliminar"
                      onClick={() => handleDelete(notif.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}